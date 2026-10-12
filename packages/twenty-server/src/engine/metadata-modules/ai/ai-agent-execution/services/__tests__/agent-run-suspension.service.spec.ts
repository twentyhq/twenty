import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

const CALLER = {
  type: 'WORKFLOW_STEP' as const,
  ref: { workflowRunId: 'run-id', stepId: 'step-id' },
};

const CLOSED_QUESTION = {
  workspaceId: 'workspace-id',
  threadId: 'thread-id',
  messageId: 'question-message-id',
  activeStreamId: null,
  turnStatus: AgentTurnStatus.CANCELLED,
};

const buildService = ({
  pendingQuestionMessageId = 'question-message-id' as string | null,
  hasPostedCall = true,
  wakeUps = [] as object[],
  waitMessageIds = [] as string[],
} = {}) => {
  const wakeUpRepository = { find: jest.fn().mockResolvedValue(wakeUps) };
  const threadRepository = {
    findOne: jest
      .fn()
      .mockResolvedValue(
        pendingQuestionMessageId === null
          ? null
          : { id: 'thread-id', pendingQuestionMessageId },
      ),
  };
  const messagePartRepository = {
    query: jest
      .fn()
      .mockResolvedValue(waitMessageIds.map((messageId) => ({ messageId }))),
    existsBy: jest.fn().mockResolvedValue(hasPostedCall),
  };
  const threadLifecycleService = {
    closePendingQuestion: jest.fn().mockResolvedValue(undefined),
  };
  const turnRecorderService = {
    endWaitingTurn: jest.fn().mockResolvedValue(undefined),
  };
  const pendingWakeUpService = {
    claim: jest
      .fn()
      .mockImplementation(async ({ wakeUpId }) =>
        wakeUps.find((wakeUp) => (wakeUp as { id: string }).id === wakeUpId),
      ),
  };
  const onOutcome = jest.fn().mockResolvedValue(undefined);

  const service = new AgentRunSuspensionService(
    wakeUpRepository as never,
    threadRepository as never,
    messagePartRepository as never,
    threadLifecycleService as never,
    turnRecorderService as never,
    pendingWakeUpService as never,
    { getHandlerOrThrow: () => ({ onOutcome }) } as never,
    {} as never,
  );

  return {
    service,
    threadLifecycleService,
    messagePartRepository,
    turnRecorderService,
    pendingWakeUpService,
    onOutcome,
  };
};

describe('AgentRunSuspensionService', () => {
  describe('closeAwaitedCalls', () => {
    it('closes the question a run waiting on an answer asked, and its wait call', async () => {
      const { service, threadLifecycleService, messagePartRepository } =
        buildService();

      await service.closeAwaitedCalls({
        workspaceId: 'workspace-id',
        threadId: 'thread-id',
        isAwaitingAnswer: true,
      });

      expect(messagePartRepository.query).toHaveBeenCalledTimes(1);
      expect(threadLifecycleService.closePendingQuestion).toHaveBeenCalledWith(
        CLOSED_QUESTION,
      );
    });

    it('keeps open a question the run did not wait on', async () => {
      const { service, threadLifecycleService } = buildService();

      await service.closeAwaitedCalls({
        workspaceId: 'workspace-id',
        threadId: 'thread-id',
        isAwaitingAnswer: false,
      });

      expect(
        threadLifecycleService.closePendingQuestion,
      ).not.toHaveBeenCalled();
    });

    it('does nothing more when the conversation waits on no question', async () => {
      const { service, threadLifecycleService } = buildService({
        pendingQuestionMessageId: null,
      });

      await service.closeAwaitedCalls({
        workspaceId: 'workspace-id',
        threadId: 'thread-id',
        isAwaitingAnswer: true,
      });

      expect(
        threadLifecycleService.closePendingQuestion,
      ).not.toHaveBeenCalled();
    });

    it('cancels the turn that waited on the dropped wait', async () => {
      const { service, turnRecorderService } = buildService({
        pendingQuestionMessageId: null,
        waitMessageIds: ['wait-message-id'],
      });

      await service.closeAwaitedCalls({
        workspaceId: 'workspace-id',
        threadId: 'thread-id',
        isAwaitingAnswer: false,
      });

      expect(turnRecorderService.endWaitingTurn).toHaveBeenCalledTimes(1);
      expect(turnRecorderService.endWaitingTurn).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        messageId: 'wait-message-id',
        status: AgentTurnStatus.CANCELLED,
      });
    });
  });

  describe('recordWaitOutcome', () => {
    it('completes the turn that waited on a wait that is over', async () => {
      const { service, turnRecorderService } = buildService({
        waitMessageIds: ['wait-message-id'],
      });

      await service.recordWaitOutcome({
        workspaceId: 'workspace-id',
        threadId: 'thread-id',
        outcome: { type: 'TIME_ELAPSED' },
      });

      expect(turnRecorderService.endWaitingTurn).toHaveBeenCalledTimes(1);
      expect(turnRecorderService.endWaitingTurn).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        messageId: 'wait-message-id',
        status: AgentTurnStatus.COMPLETED,
      });
    });

    it('goes on when the turn cannot be ended', async () => {
      const { service, turnRecorderService } = buildService({
        waitMessageIds: ['wait-message-id'],
      });

      turnRecorderService.endWaitingTurn.mockRejectedValue(new Error('boom'));

      await expect(
        service.recordWaitOutcome({
          workspaceId: 'workspace-id',
          threadId: 'thread-id',
          outcome: { type: 'EXPIRED' },
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('closePostedCalls', () => {
    const cancelledWakeUp = {
      condition: { type: 'ANSWER', threadId: 'thread-id', toolCallId: 'call' },
    };

    it('closes the question that holds the call a cancelled wake-up waited on', async () => {
      const { service, threadLifecycleService } = buildService();

      await service.closePostedCalls({
        workspaceId: 'workspace-id',
        cancelledWakeUps: [cancelledWakeUp, { condition: { type: 'TIME' } }],
      } as never);

      expect(threadLifecycleService.closePendingQuestion).toHaveBeenCalledTimes(
        1,
      );
      expect(threadLifecycleService.closePendingQuestion).toHaveBeenCalledWith(
        CLOSED_QUESTION,
      );
    });

    it('keeps open a question that asks something else', async () => {
      const { service, threadLifecycleService } = buildService({
        hasPostedCall: false,
      });

      await service.closePostedCalls({
        workspaceId: 'workspace-id',
        cancelledWakeUps: [cancelledWakeUp],
      } as never);

      expect(
        threadLifecycleService.closePendingQuestion,
      ).not.toHaveBeenCalled();
    });
  });

  describe('releaseForCaller', () => {
    it('drops the runs the caller waits on and closes the questions they asked', async () => {
      const { service, pendingWakeUpService, threadLifecycleService } =
        buildService({
          wakeUps: [
            {
              id: 'wake-up-id',
              ownerId: 'thread-id',
              condition: { type: 'ANSWER', threadId: 'thread-id' },
              payload: { caller: CALLER },
            },
          ],
        });

      await service.releaseForCaller({
        workspaceId: 'workspace-id',
        caller: { type: 'WORKFLOW_STEP', ref: { workflowRunId: 'run-id' } },
      });

      expect(pendingWakeUpService.claim).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        wakeUpId: 'wake-up-id',
      });
      expect(threadLifecycleService.closePendingQuestion).toHaveBeenCalledWith(
        CLOSED_QUESTION,
      );
    });
  });

  describe('settle', () => {
    it('hands the outcome and the run so far to the caller', async () => {
      const { service, onOutcome, threadLifecycleService } = buildService();
      const summary = { totalCredits: 1 } as never;

      await service.settle({
        workspaceId: 'workspace-id',
        threadId: 'thread-id',
        suspension: {
          caller: CALLER,
          runSpec: {} as never,
          summary,
          continuationCount: 2,
        },
        outcome: { status: 'FAILED', error: 'boom' },
      });

      expect(
        threadLifecycleService.closePendingQuestion,
      ).not.toHaveBeenCalled();
      expect(onOutcome).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        caller: CALLER,
        threadId: 'thread-id',
        outcome: { status: 'FAILED', error: 'boom' },
        summary,
      });
    });
  });
});
