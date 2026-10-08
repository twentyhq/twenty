import { AgentCallerConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-caller-conversation.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const SENDER = {
  type: 'workflow' as const,
  workflowId: 'workflow-id',
  workflowName: 'New deals',
};

const OPEN_ARGS = {
  workspaceId: 'workspace-id',
  sender: SENDER,
  title: 'Draft the quote',
  threadKey: 'run-id:step-id',
  fallbackThreadKey: 'run-id:step-id:run-id:step-id',
};

const buildService = ({ isCreated = true } = {}) => {
  const agentInboxService = {
    openThread: jest
      .fn()
      .mockImplementation(
        ({ workspaceMemberIds }: { workspaceMemberIds: string[] }) =>
          Promise.resolve({
            thread: { id: `thread-for-${workspaceMemberIds[0] ?? 'nobody'}` },
            isCreated,
          }),
      ),
  };
  const agentRunSuspensionService = {
    isConversationWaiting: jest.fn().mockResolvedValue(false),
  };

  const service = new AgentCallerConversationService(
    agentInboxService as never,
    agentRunSuspensionService as never,
    {} as never,
    {} as never,
  );

  return { service, agentInboxService, agentRunSuspensionService };
};

describe('AgentCallerConversationService', () => {
  describe('openConversation', () => {
    it('opens the conversation with the recipient, filed under done', async () => {
      const { service, agentInboxService } = buildService();

      const conversation = await service.openConversation({
        ...OPEN_ARGS,
        recipientWorkspaceMemberId: 'recipient-id',
        fallbackRecipientWorkspaceMemberId: 'creator-id',
      });

      expect(conversation).toEqual({
        status: 'OPENED',
        threadId: 'thread-for-recipient-id',
        isCreated: true,
      });
      expect(agentInboxService.openThread).toHaveBeenCalledTimes(1);
      expect(agentInboxService.openThread).toHaveBeenCalledWith({
        workspaceId: 'workspace-id',
        sender: SENDER,
        workspaceMemberIds: ['recipient-id'],
        threadKey: 'run-id:step-id',
        title: 'Draft the quote',
        isArchivedOnCreate: true,
      });
    });

    it('falls back to the fallback recipient without a recipient', async () => {
      const { service } = buildService();

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: null,
          fallbackRecipientWorkspaceMemberId: 'creator-id',
        }),
      ).resolves.toMatchObject({ threadId: 'thread-for-creator-id' });
    });

    it('keeps a conversation no inbox receives when the fallback recipient cannot have it', async () => {
      const { service, agentInboxService } = buildService();

      agentInboxService.openThread.mockRejectedValueOnce(
        new AiException(
          'Thread owner is no longer a workspace member',
          AiExceptionCode.THREAD_NOT_FOUND,
        ),
      );

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: null,
          fallbackRecipientWorkspaceMemberId: 'creator-id',
        }),
      ).resolves.toMatchObject({ threadId: 'thread-for-nobody' });
    });

    it('keeps a conversation no inbox receives without any recipient', async () => {
      const { service } = buildService();

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: null,
        }),
      ).resolves.toMatchObject({ threadId: 'thread-for-nobody' });
    });

    it('fails when the recipient cannot have the conversation', async () => {
      const { service, agentInboxService } = buildService();

      agentInboxService.openThread.mockRejectedValue(
        new AiException(
          'Thread owner is no longer a workspace member',
          AiExceptionCode.THREAD_NOT_FOUND,
        ),
      );

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: 'recipient-id',
        }),
      ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
    });

    it('starts its own conversation when the recipient cannot join the one its key names', async () => {
      const { service, agentInboxService } = buildService();

      agentInboxService.openThread.mockRejectedValueOnce(
        new AiException('Thread not found', AiExceptionCode.THREAD_NOT_FOUND),
      );

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: 'recipient-id',
        }),
      ).resolves.toMatchObject({ threadId: 'thread-for-recipient-id' });
      expect(agentInboxService.openThread).toHaveBeenLastCalledWith(
        expect.objectContaining({ threadKey: 'run-id:step-id:run-id:step-id' }),
      );
    });

    it('starts its own conversation when the recipient deleted the one its key names', async () => {
      const { service, agentInboxService } = buildService();

      agentInboxService.openThread.mockResolvedValueOnce({
        thread: { id: 'deleted-thread-id', deletedAt: '2026-01-01' },
        isCreated: false,
      });

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: 'recipient-id',
        }),
      ).resolves.toEqual({
        status: 'OPENED',
        threadId: 'thread-for-recipient-id',
        isCreated: true,
      });
      expect(agentInboxService.openThread).toHaveBeenLastCalledWith(
        expect.objectContaining({ threadKey: 'run-id:step-id:run-id:step-id' }),
      );
    });

    it('starts its own conversation while the one its key names waits on another answer', async () => {
      const { service, agentInboxService } = buildService();

      agentInboxService.openThread.mockResolvedValueOnce({
        thread: {
          id: 'waiting-thread-id',
          pendingQuestionMessageId: 'question-message-id',
        },
        isCreated: false,
      });

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: 'recipient-id',
        }),
      ).resolves.toMatchObject({ threadId: 'thread-for-recipient-id' });
    });

    it('starts its own conversation while the one its key names holds a suspended run', async () => {
      const { service, agentInboxService, agentRunSuspensionService } =
        buildService();

      agentInboxService.openThread.mockResolvedValueOnce({
        thread: { id: 'suspended-thread-id' },
        isCreated: false,
      });
      agentRunSuspensionService.isConversationWaiting.mockImplementation(
        async ({ threadId }: { threadId: string }) =>
          threadId === 'suspended-thread-id',
      );

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: 'recipient-id',
        }),
      ).resolves.toMatchObject({ threadId: 'thread-for-recipient-id' });
    });

    it('reports a conversation the recipient also deleted under the fallback key', async () => {
      const { service, agentInboxService } = buildService();

      agentInboxService.openThread.mockResolvedValue({
        thread: { id: 'deleted-thread-id', deletedAt: '2026-01-01' },
        isCreated: false,
      });

      await expect(
        service.openConversation({
          ...OPEN_ARGS,
          recipientWorkspaceMemberId: 'recipient-id',
        }),
      ).resolves.toEqual({ status: 'DELETED' });
    });
  });
});
