import { randomUUID } from 'node:crypto';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus, WorkflowActionType } from 'twenty-shared/workflow';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

const REQUEST_FORM_TOOL_NAME = 'request_form';

// A form step is answered in its conversation, as a request_form call named
// after the step that the conversation waits on. A form step waiting since
// before this release has none, so each one still waiting gets the
// conversation its step now records.
@RegisteredWorkspaceCommand('2.44.0', 1790772993322)
@Command({
  name: 'upgrade:2-44:record-pending-form-conversations',
  description:
    'Record the conversation each form step waiting before this release is answered in',
})
export class RecordPendingFormConversationsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly storage: AgentHistoryUpgradeStorageService,
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

    if (
      !isDefined(
        flatFieldMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.fields.workflowRun
            .universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `Conversations cannot name a workflow run in workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;

    // The history fence: its tables cannot move while the forms are recorded.
    const recordedCount = await this.storage.run(workspaceId, () =>
      this.workspaceOrmManager.executeInWorkspaceContext(
        () => this.recordPendingFormConversations({ isDryRun }),
        buildSystemAuthContext(workspaceId),
      ),
    );

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would record' : 'Recorded'} ${recordedCount} conversation(s) for pending form steps in workspace ${workspaceId}`,
    );
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // The recorded conversations are where these forms are answered from now
    // on, so they are left in place.
  }

  private async recordPendingFormConversations({
    isDryRun,
  }: {
    isDryRun: boolean;
  }): Promise<number> {
    const getRepository = <TEntity extends object>(objectName: string) =>
      this.workspaceOrmManager.getRepository<TEntity>(objectName, {
        shouldBypassPermissionChecks: true,
      });
    const workflowRunRepository =
      getRepository<WorkflowRunWorkspaceEntity>('workflowRun');
    const threadRepository =
      getRepository<AgentChatThreadWorkspaceEntity>('agentChatThread');
    const turnRepository = getRepository<AgentTurnWorkspaceEntity>('agentTurn');
    const messageRepository =
      getRepository<AgentMessageWorkspaceEntity>('agentMessage');
    const messagePartRepository =
      getRepository<AgentMessagePartWorkspaceEntity>('agentMessagePart');

    // Only a running run accepts a submission.
    const workflowRuns = await workflowRunRepository.find({
      where: { status: WorkflowRunStatus.RUNNING },
      select: { id: true, state: true },
    });

    let recordedCount = 0;

    for (const workflowRun of workflowRuns) {
      const stepInfos = { ...workflowRun.state?.stepInfos };
      let hasRecordedConversation = false;

      for (const step of workflowRun.state?.flow?.steps ?? []) {
        const stepInfo = stepInfos[step.id];

        if (
          step.type !== WorkflowActionType.FORM ||
          stepInfo?.status !== StepStatus.PENDING ||
          isDefined(stepInfo.error) ||
          isDefined(stepInfo.threadId)
        ) {
          continue;
        }

        recordedCount++;

        if (isDryRun) {
          continue;
        }

        const threadId = randomUUID();
        const turnId = randomUUID();
        const messageId = randomUUID();

        await threadRepository.insert({
          id: threadId,
          title: step.name,
          workflowRunId: workflowRun.id,
        });
        await turnRepository.insert({ id: turnId, threadId });
        await messageRepository.insert({
          id: messageId,
          threadId,
          turnId,
          role: AgentMessageRole.ASSISTANT,
          processedAt: new Date().toISOString(),
        });
        await messagePartRepository.insert({
          messageId,
          orderIndex: 0,
          type: `tool-${REQUEST_FORM_TOOL_NAME}`,
          toolName: REQUEST_FORM_TOOL_NAME,
          toolCallId: step.id,
          toolInput: { fields: step.settings.input },
          toolOutput: {
            success: true,
            message: 'Form presented to the user; awaiting their answer.',
            result: { status: 'pending' },
          },
          state: 'output-available',
        });
        await threadRepository.update(
          { id: threadId },
          { pendingQuestionMessageId: messageId },
        );

        stepInfos[step.id] = { ...stepInfo, threadId };
        hasRecordedConversation = true;
      }

      if (hasRecordedConversation) {
        await workflowRunRepository.update(workflowRun.id, {
          state: { ...workflowRun.state, stepInfos },
        });
      }
    }

    return recordedCount;
  }
}
