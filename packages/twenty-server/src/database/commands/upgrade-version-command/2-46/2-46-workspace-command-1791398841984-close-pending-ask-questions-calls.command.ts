import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RESUME_PENDING_WAKE_UP_JOB_NAME } from 'src/engine/core-modules/pending-wake-up/constants/resume-pending-wake-up-job-name.constant';
import { type ResumePendingWakeUpJobData } from 'src/engine/core-modules/pending-wake-up/types/resume-pending-wake-up-job-data.type';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const SKIPPED_MESSAGE = 'The questions were closed without an answer.';

// ask_questions has not been offered since ask_question replaced it, and its remaining pending
// calls are closed before its code goes. A conversation left with nothing pending stops waiting,
// and an agent run suspended on it goes on, as when a member moves on without answering
@RegisteredWorkspaceCommand('2.46.0', 1791398841984)
@Command({
  name: 'upgrade:2-46:close-pending-ask-questions-calls',
  description: 'Close the ask_questions calls still waiting on an answer',
})
export class ClosePendingAskQuestionsCallsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly storage: AgentHistoryUpgradeStorageService,
    @InjectMessageQueue(MessageQueue.delayedJobsQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const hasRequiredFields = [
      STANDARD_OBJECTS.agentMessagePart.fields.toolOutput.universalIdentifier,
      STANDARD_OBJECTS.agentChatThread.fields.pendingQuestionMessageId
        .universalIdentifier,
      STANDARD_OBJECTS.agentTurn.fields.status.universalIdentifier,
    ].every((universalIdentifier) =>
      isDefined(
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier,
        }),
      ),
    );

    if (!hasRequiredFields) {
      this.logger.log(
        `Chat history fields not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;

    const { closedThreadCount, wakeUpsToResolve } = await this.storage.run(
      workspaceId,
      async ({ manager, table }) => {
        const pendingCalls: { threadId: string }[] = await manager.query(
          `SELECT DISTINCT message."threadId"
           FROM ${table('agentMessagePart')} part
           JOIN ${table('agentMessage')} message ON message.id = part."messageId"
           WHERE part."toolName" = 'ask_questions'
             AND part."toolOutput" -> 'result' ->> 'status' = 'pending'`,
        );

        if (isDryRun) {
          return {
            closedThreadCount: pendingCalls.length,
            wakeUpsToResolve: [],
          };
        }

        const threadIds = pendingCalls.map(({ threadId }) => threadId);

        await manager.query(
          `UPDATE ${table('agentMessagePart')} part
           SET "toolOutput" = jsonb_set(part."toolOutput", '{result,status}', '"skipped"')
             || jsonb_build_object('success', true, 'message', $2::text),
             "updatedAt" = now()
           FROM ${table('agentMessage')} message
           WHERE message.id = part."messageId"
             AND message."threadId" = ANY($1::uuid[])
             AND part."toolName" = 'ask_questions'
             AND part."toolOutput" -> 'result' ->> 'status' = 'pending'`,
          [threadIds, SKIPPED_MESSAGE],
        );

        const settledThreads: { id: string }[] = await manager.query(
          `SELECT thread.id
           FROM ${table('agentChatThread')} thread
           WHERE thread.id = ANY($1::uuid[])
             AND NOT EXISTS (
               SELECT 1
               FROM ${table('agentMessagePart')} part
               JOIN ${table('agentMessage')} message ON message.id = part."messageId"
               WHERE message."threadId" = thread.id
                 AND part."toolOutput" -> 'result' ->> 'status' = 'pending'
             )`,
          [threadIds],
        );

        await manager.query(
          `WITH cleared AS (
             SELECT id, "pendingQuestionMessageId" AS "messageId"
             FROM ${table('agentChatThread')}
             WHERE id = ANY($1::uuid[]) AND "pendingQuestionMessageId" IS NOT NULL
           ), thread AS (
             UPDATE ${table('agentChatThread')} thread
             SET "pendingQuestionMessageId" = NULL, "updatedAt" = now()
             FROM cleared WHERE thread.id = cleared.id
           )
           UPDATE ${table('agentTurn')} turn
           SET "status" = 'completed', "endedAt" = now(), "updatedAt" = now()
           FROM cleared
           JOIN ${table('agentMessage')} message ON message.id = cleared."messageId"
           WHERE turn.id = message."turnId" AND turn."status" = 'waiting_for_input'`,
          [settledThreads.map(({ id }) => id)],
        );

        // read from what is stored rather than from this run's closures, so a run whose
        // wake-up could not be resolved last time is continued on the next one
        const wakeUps: { id: string }[] = await manager.query(
          `SELECT wake_up.id
           FROM "core"."pendingWakeUp" wake_up
           WHERE wake_up."workspaceId" = $1
             AND wake_up."ownerType" = 'AGENT_RUN'
             AND wake_up."condition" ->> 'type' = 'ANSWER'
             AND EXISTS (
               SELECT 1
               FROM ${table('agentMessagePart')} part
               JOIN ${table('agentMessage')} message ON message.id = part."messageId"
               WHERE message."threadId" = wake_up."ownerId"
                 AND part."toolName" = 'ask_questions'
                 AND part."toolOutput" ->> 'message' = $2
             )
             AND NOT EXISTS (
               SELECT 1
               FROM ${table('agentMessagePart')} part
               JOIN ${table('agentMessage')} message ON message.id = part."messageId"
               WHERE message."threadId" = wake_up."ownerId"
                 AND part."toolOutput" -> 'result' ->> 'status' = 'pending'
             )`,
          [workspaceId, SKIPPED_MESSAGE],
        );

        return {
          closedThreadCount: pendingCalls.length,
          wakeUpsToResolve: wakeUps,
        };
      },
    );

    // the closed questions count as the answer the run waits on. A duplicate finds the wake-up
    // claimed, so resolving again is safe
    for (const wakeUp of wakeUpsToResolve) {
      await this.messageQueueService.add<ResumePendingWakeUpJobData>(
        RESUME_PENDING_WAKE_UP_JOB_NAME,
        { workspaceId, wakeUpId: wakeUp.id, answer: { result: {} } },
      );
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would close' : 'Closed'} pending ask_questions calls in ${closedThreadCount} thread(s) of workspace ${workspaceId}, continuing ${wakeUpsToResolve.length} agent run(s)`,
    );
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // A closed call has no answer to bring back
  }
}
