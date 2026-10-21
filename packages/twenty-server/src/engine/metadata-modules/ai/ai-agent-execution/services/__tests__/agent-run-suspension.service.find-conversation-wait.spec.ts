import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const THREAD_ID = 'thread-id';

const buildService = ({
  wakeUps = [],
  pendingQuestionMessageId = null,
}: {
  wakeUps?: { id: string; ownerType: string; ownerId: string }[];
  pendingQuestionMessageId?: string | null;
} = {}) => {
  const wakeUpRepository = { find: jest.fn().mockResolvedValue(wakeUps) };
  const threadRepository = {
    findOne: jest
      .fn()
      .mockResolvedValue({ id: THREAD_ID, pendingQuestionMessageId }),
  };

  const service = new AgentRunSuspensionService(
    wakeUpRepository as never,
    threadRepository as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  return { service, threadRepository };
};

const SUSPENDED_RUN = {
  id: 'run-wake-up-id',
  ownerType: 'AGENT_RUN',
  ownerId: THREAD_ID,
};
const POSTED_CALL = {
  id: 'step-wake-up-id',
  ownerType: 'WORKFLOW_STEP',
  ownerId: 'workflow-run-id',
};

describe('AgentRunSuspensionService findConversationWait', () => {
  it('reads a conversation with nothing pending as not waiting', async () => {
    const { service } = buildService();

    await expect(
      service.findConversationWait({
        workspaceId: 'workspace-id',
        threadId: THREAD_ID,
      }),
    ).resolves.toEqual({
      pendingQuestionMessageId: null,
      suspendedRun: null,
      hasPostedCall: false,
      isWaiting: false,
    });
  });

  it('reads a pending question as waiting', async () => {
    const { service } = buildService({
      pendingQuestionMessageId: 'question-message-id',
    });

    await expect(
      service.findConversationWait({
        workspaceId: 'workspace-id',
        threadId: THREAD_ID,
      }),
    ).resolves.toMatchObject({
      pendingQuestionMessageId: 'question-message-id',
      isWaiting: true,
    });
  });

  it('reads a suspended run or a posted call as waiting', async () => {
    const { service } = buildService({ wakeUps: [SUSPENDED_RUN, POSTED_CALL] });

    await expect(
      service.findConversationWait({
        workspaceId: 'workspace-id',
        threadId: THREAD_ID,
      }),
    ).resolves.toMatchObject({
      suspendedRun: { id: 'run-wake-up-id' },
      hasPostedCall: true,
      isWaiting: true,
    });
  });

  it('takes the pending question from a conversation the caller already read', async () => {
    const { service, threadRepository } = buildService();

    await expect(
      service.findConversationWait({
        workspaceId: 'workspace-id',
        threadId: THREAD_ID,
        thread: { pendingQuestionMessageId: 'question-message-id' },
      }),
    ).resolves.toMatchObject({ isWaiting: true });
    expect(threadRepository.findOne).not.toHaveBeenCalled();
  });
});

describe('AgentRunSuspensionService assertConversationNotSuspended', () => {
  it('refuses a run while a wake-up holds the conversation', async () => {
    const { service } = buildService({ wakeUps: [POSTED_CALL] });

    await expect(
      service.assertConversationNotSuspended({
        workspaceId: 'workspace-id',
        threadId: THREAD_ID,
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_AWAITING_ANSWER });
  });

  it('lets a run in while only a question waits on the member', async () => {
    const { service } = buildService({
      pendingQuestionMessageId: 'question-message-id',
    });

    await expect(
      service.assertConversationNotSuspended({
        workspaceId: 'workspace-id',
        threadId: THREAD_ID,
      }),
    ).resolves.toBeUndefined();
  });
});
