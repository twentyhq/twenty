import { Test, type TestingModule } from '@nestjs/testing';

import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { InboxRouterService } from 'src/engine/core-modules/inbox/services/inbox-router.service';
import { AgentChatInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox.service';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const USER_WORKSPACE_ID = 'user-workspace-id';

describe('AgentChatInboxService', () => {
  let service: AgentChatInboxService;

  const inboxRouterService = {
    route: jest.fn(),
    renameThreadItem: jest.fn(),
    clearByThreadId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentChatInboxService,
        { provide: InboxRouterService, useValue: inboxRouterService },
      ],
    }).compile();

    service = module.get<AgentChatInboxService>(AgentChatInboxService);
  });

  describe('onTurnFailed', () => {
    it('routes the failure onto the thread so a stale question does not outlive it', async () => {
      await service.onTurnFailed({
        threadId: THREAD_ID,
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        errorMessage: 'The model stopped responding',
      });

      expect(inboxRouterService.route).toHaveBeenCalledWith({
        workspaceId: WORKSPACE_ID,
        producer: 'agentChat',
        icon: 'IconAlertTriangle',
        priority: InboxItemPriority.NEEDS_ACTION,
        summary: 'The model stopped responding',
        subject: {
          kind: 'thread',
          threadId: THREAD_ID,
          ownerUserWorkspaceId: USER_WORKSPACE_ID,
        },
      });
    });

    it('omits the context when there is no message rather than storing an empty summary', async () => {
      await service.onTurnFailed({
        threadId: THREAD_ID,
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        errorMessage: '',
      });

      expect(inboxRouterService.route).toHaveBeenCalledWith(
        expect.not.objectContaining({ summary: expect.anything() }),
      );
    });
  });

  describe('onTurnCompleted', () => {
    it('reports a pending question so the item asks for an answer', async () => {
      await service.onTurnCompleted({
        threadId: THREAD_ID,
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        hasPendingQuestion: true,
      });

      expect(inboxRouterService.route).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'IconHelpCircle',
          priority: InboxItemPriority.NEEDS_ACTION,
        }),
      );
    });

    it('returns the item to a conversation once no question is pending', async () => {
      await service.onTurnCompleted({
        threadId: THREAD_ID,
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        hasPendingQuestion: false,
      });

      expect(inboxRouterService.route).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: 'IconMessageCircle',
          priority: InboxItemPriority.UPDATE,
        }),
      );
    });
  });
});
