import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const THREAD_ID = 'thread-id';

const buildService = ({
  wakeUps = [],
}: {
  wakeUps?: { id: string; ownerType: string; ownerId: string }[];
} = {}) =>
  new AgentRunSuspensionService(
    { find: jest.fn().mockResolvedValue(wakeUps) } as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

const buildThread = (pendingQuestionMessageId: string | null = null) => ({
  id: THREAD_ID,
  pendingQuestionMessageId,
});

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
    await expect(
      buildService().findConversationWait({
        workspaceId: 'workspace-id',
        thread: buildThread(),
      }),
    ).resolves.toEqual({
      pendingQuestionMessageId: null,
      suspendedRun: null,
      hasPostedCall: false,
      isWaiting: false,
    });
  });

  it('reads a pending question as waiting', async () => {
    await expect(
      buildService().findConversationWait({
        workspaceId: 'workspace-id',
        thread: buildThread('question-message-id'),
      }),
    ).resolves.toMatchObject({
      pendingQuestionMessageId: 'question-message-id',
      isWaiting: true,
    });
  });

  it('reads a suspended run or a posted call as waiting', async () => {
    await expect(
      buildService({
        wakeUps: [SUSPENDED_RUN, POSTED_CALL],
      }).findConversationWait({
        workspaceId: 'workspace-id',
        thread: buildThread(),
      }),
    ).resolves.toMatchObject({
      suspendedRun: { id: 'run-wake-up-id' },
      hasPostedCall: true,
      isWaiting: true,
    });
  });
});

describe('AgentRunSuspensionService assertConversationNotSuspended', () => {
  it('refuses a run while a wake-up holds the conversation', async () => {
    await expect(
      buildService({ wakeUps: [POSTED_CALL] }).assertConversationNotSuspended({
        workspaceId: 'workspace-id',
        threadId: THREAD_ID,
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_AWAITING_ANSWER });
  });

  it('lets a run in while no wake-up holds the conversation', async () => {
    await expect(
      buildService().assertConversationNotSuspended({
        workspaceId: 'workspace-id',
        threadId: THREAD_ID,
      }),
    ).resolves.toBeUndefined();
  });
});
