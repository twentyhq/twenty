import { Command } from 'nest-commander';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { CONTINUE_AGENT_RUN_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/continue-agent-run-job-name.constant';
import { type ContinueAgentRunJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/continue-agent-run-job-data.type';

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
    private readonly storage: AgentHistoryUpgradeStorageService,
    @InjectMessageQueue(MessageQueue.aiQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { closedThreadCount, suspensionsToContinue } = await this.storage.run(
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
            suspensionsToContinue: [],
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
        // continuation could not be queued last time is continued on the next one
        const suspensions: { id: string; resumeCount: number }[] =
          await manager.query(
            `SELECT suspension.id, suspension."resumeCount"
             FROM "core"."agentRunSuspension" suspension
             WHERE suspension."workspaceId" = $1
               AND suspension."runSpec" IS NOT NULL
               AND EXISTS (
                 SELECT 1
                 FROM ${table('agentMessagePart')} part
                 JOIN ${table('agentMessage')} message ON message.id = part."messageId"
                 WHERE message."threadId" = suspension."threadId"
                   AND part."toolName" = 'ask_questions'
                   AND part."toolOutput" ->> 'message' = $2
               )
               AND NOT EXISTS (
                 SELECT 1
                 FROM ${table('agentMessagePart')} part
                 JOIN ${table('agentMessage')} message ON message.id = part."messageId"
                 WHERE message."threadId" = suspension."threadId"
                   AND part."toolOutput" -> 'result' ->> 'status' = 'pending'
               )`,
            [workspaceId, SKIPPED_MESSAGE],
          );

        return {
          closedThreadCount: pendingCalls.length,
          suspensionsToContinue: suspensions,
        };
      },
    );

    // a duplicate finds the run moved on through its resume count, so continuing again is safe
    for (const suspension of suspensionsToContinue) {
      await this.messageQueueService.add<ContinueAgentRunJobData>(
        CONTINUE_AGENT_RUN_JOB_NAME,
        {
          workspaceId,
          suspensionId: suspension.id,
          resumeCount: suspension.resumeCount,
        },
      );
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would close' : 'Closed'} pending ask_questions calls in ${closedThreadCount} thread(s) of workspace ${workspaceId}, continuing ${suspensionsToContinue.length} agent run(s)`,
    );
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // A closed call has no answer to bring back
  }
}
