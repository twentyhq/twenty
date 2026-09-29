import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus, WorkflowActionType } from 'twenty-shared/workflow';
import { IsNull, Not } from 'typeorm';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { findPendingAskQuestionsPart } from 'src/database/commands/upgrade-version-command/2-44/utils/find-pending-ask-questions-part.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { InputAskStatus } from 'src/modules/input-ask/enums/input-ask-status.enum';
import { type InputAskWorkspaceEntity } from 'src/modules/input-ask/standard-objects/input-ask.workspace-entity';
import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

type PendingQuestionThread = Pick<
  AgentChatThreadWorkspaceEntity,
  'id' | 'pendingQuestionMessageId' | 'workflowRunId' | 'workspaceMemberId'
>;

// Every pause for a person is now answered through its Ask, and one that
// started before this release may have none: an agent question was answered
// through its conversation's pending marker, a form step through its run.
// Each one still waiting gets the Ask it would have opened.
@RegisteredWorkspaceCommand('2.44.0', 1790681152511)
@Command({
  name: 'upgrade:2-44:open-asks-for-pending-input',
  description:
    'Open an Ask for every agent question and form step still waiting on an answer',
})
export class OpenAsksForPendingInputCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.inputAsk.universalIdentifier
        ],
      ) ||
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `inputAsk or agentChatThread object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    // The history fence: its tables cannot move while the questions are read.
    const isDryRun = options.dryRun ?? false;
    const questionCount = await this.storage.run(workspaceId, () =>
      this.workspaceOrmManager.executeInWorkspaceContext(
        () => this.openAsksForPendingQuestions({ isDryRun }),
        buildSystemAuthContext(workspaceId),
      ),
    );
    const formStepCount =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () => this.openAsksForPendingFormSteps({ isDryRun }),
        buildSystemAuthContext(workspaceId),
      );

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would open' : 'Opened'} ${questionCount} Ask(s) for pending agent questions and ${formStepCount} for pending form steps in workspace ${workspaceId}`,
    );
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // The Asks are where these pauses are answered from now on; the
    // conversations' pending markers are left as they were.
  }

  private async openAsksForPendingQuestions({
    isDryRun,
  }: {
    isDryRun: boolean;
  }): Promise<number> {
    const threadRepository =
      this.workspaceOrmManager.getRepository<AgentChatThreadWorkspaceEntity>(
        'agentChatThread',
        { shouldBypassPermissionChecks: true },
      );

    const threads: PendingQuestionThread[] = await threadRepository.find({
      where: { pendingQuestionMessageId: Not(IsNull()) },
      select: {
        id: true,
        pendingQuestionMessageId: true,
        workflowRunId: true,
        workspaceMemberId: true,
      },
    });

    let openedCount = 0;

    for (const thread of threads) {
      const isOpened = await this.openAskForThread({
        thread,
        isDryRun,
      });

      if (isOpened) {
        openedCount++;
      }
    }

    return openedCount;
  }

  private async openAskForThread({
    thread,
    isDryRun,
  }: {
    thread: PendingQuestionThread;
    isDryRun: boolean;
  }): Promise<boolean> {
    if (!isDefined(thread.pendingQuestionMessageId)) {
      return false;
    }

    const messageRepository =
      this.workspaceOrmManager.getRepository<AgentMessageWorkspaceEntity>(
        'agentMessage',
        { shouldBypassPermissionChecks: true },
      );
    const messagePartRepository =
      this.workspaceOrmManager.getRepository<AgentMessagePartWorkspaceEntity>(
        'agentMessagePart',
        { shouldBypassPermissionChecks: true },
      );
    const inputAskRepository =
      this.workspaceOrmManager.getRepository<InputAskWorkspaceEntity>(
        'inputAsk',
        { shouldBypassPermissionChecks: true },
      );

    const questionMessage = await messageRepository.findOne({
      where: { id: thread.pendingQuestionMessageId, threadId: thread.id },
      select: { id: true, turnId: true },
    });

    if (!isDefined(questionMessage)) {
      return false;
    }

    const pendingPart = findPendingAskQuestionsPart(
      await messagePartRepository.find({
        where: { messageId: questionMessage.id },
        select: { toolName: true, toolCallId: true, toolOutput: true },
      }),
    );

    if (!isDefined(pendingPart)) {
      return false;
    }

    const existingInputAsk = await inputAskRepository.findOne({
      where: { threadId: thread.id, toolCallId: pendingPart.toolCallId },
      select: { id: true },
    });

    if (isDefined(existingInputAsk)) {
      return false;
    }

    if (isDryRun) {
      return true;
    }

    const turnSender = isDefined(questionMessage.turnId)
      ? await messageRepository.findOne({
          where: {
            turnId: questionMessage.turnId,
            role: AgentMessageRole.USER,
            senderWorkspaceMemberId: Not(IsNull()),
          },
          order: { createdAt: 'ASC' },
          select: { senderWorkspaceMemberId: true },
        })
      : null;

    const lowestPosition = await inputAskRepository.minimum('position');

    try {
      await inputAskRepository.insert({
        name: pendingPart.questions[0]?.question ?? '',
        status: InputAskStatus.PENDING,
        form: { kind: 'questions', questions: pendingPart.questions },
        threadId: thread.id,
        toolCallId: pendingPart.toolCallId,
        workflowRunId: thread.workflowRunId,
        stepId: await this.findRunStepId(thread),
        assigneeId:
          turnSender?.senderWorkspaceMemberId ??
          thread.workspaceMemberId ??
          null,
        position: (lowestPosition ?? 0) - 1,
      });
    } catch (error) {
      // An Ask opened for the same call in the meantime is the one wanted.
      if (
        error instanceof TwentyOrmException &&
        error.code === TwentyOrmExceptionCode.DUPLICATE_ENTRY_DETECTED
      ) {
        return false;
      }

      throw error;
    }

    return true;
  }

  private async openAsksForPendingFormSteps({
    isDryRun,
  }: {
    isDryRun: boolean;
  }): Promise<number> {
    const workflowRunRepository =
      this.workspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
        { shouldBypassPermissionChecks: true },
      );
    const inputAskRepository =
      this.workspaceOrmManager.getRepository<InputAskWorkspaceEntity>(
        'inputAsk',
        { shouldBypassPermissionChecks: true },
      );

    // Only a running run accepts a submission.
    const workflowRuns = await workflowRunRepository.find({
      where: { status: WorkflowRunStatus.RUNNING },
      select: { id: true, state: true, createdBy: true },
    });

    let openedCount = 0;

    for (const workflowRun of workflowRuns) {
      const stepInfos = workflowRun.state?.stepInfos ?? {};

      for (const step of workflowRun.state?.flow?.steps ?? []) {
        if (
          step.type !== WorkflowActionType.FORM ||
          stepInfos[step.id]?.status !== StepStatus.PENDING ||
          isDefined(stepInfos[step.id]?.error)
        ) {
          continue;
        }

        const existingInputAsk = await inputAskRepository.findOne({
          where: {
            workflowRunId: workflowRun.id,
            stepId: step.id,
            toolCallId: IsNull(),
          },
          select: { id: true },
        });

        if (isDefined(existingInputAsk)) {
          continue;
        }

        openedCount++;

        if (isDryRun) {
          continue;
        }

        const lowestPosition = await inputAskRepository.minimum('position');

        await inputAskRepository.insert({
          name: step.name,
          status: InputAskStatus.PENDING,
          form: {
            kind: 'formFields',
            fields: step.settings.input,
          },
          workflowRunId: workflowRun.id,
          stepId: step.id,
          assigneeId:
            workflowRun.createdBy?.source === FieldActorSource.MANUAL
              ? (workflowRun.createdBy.workspaceMemberId ?? null)
              : null,
          position: (lowestPosition ?? 0) - 1,
        });
      }
    }

    return openedCount;
  }

  // A run conversation belongs to the step whose current execution recorded
  // it, which only the run's state says.
  private async findRunStepId(
    thread: PendingQuestionThread,
  ): Promise<string | null> {
    if (!isDefined(thread.workflowRunId)) {
      return null;
    }

    const workflowRun = await this.workspaceOrmManager
      .getRepository<WorkflowRunWorkspaceEntity>('workflowRun', {
        shouldBypassPermissionChecks: true,
      })
      .findOne({
        where: { id: thread.workflowRunId },
        select: { id: true, state: true },
      });

    const stepInfos = workflowRun?.state?.stepInfos ?? {};

    return (
      Object.keys(stepInfos).find(
        (stepId) => stepInfos[stepId]?.threadId === thread.id,
      ) ?? null
    );
  }
}
