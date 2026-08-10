import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AdminPanelChatService } from 'src/engine/core-modules/admin-panel/services/admin-panel-chat.service';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  AgentMessageEntity,
  AgentMessageRole,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';

const createMessageQueryBuilderMock = (getRawManyResult: () => unknown[]) => {
  const queryBuilderMock = {
    select: jest.fn(),
    addSelect: jest.fn(),
    where: jest.fn(),
    groupBy: jest.fn(),
    getRawMany: jest
      .fn()
      .mockImplementation(() => Promise.resolve(getRawManyResult())),
  };

  for (const method of ['select', 'addSelect', 'where', 'groupBy'] as const) {
    queryBuilderMock[method].mockReturnValue(queryBuilderMock);
  }

  return queryBuilderMock;
};

describe('AdminPanelChatService', () => {
  let service: AdminPanelChatService;
  let workspaceRepositoryFindOneMock: jest.Mock;
  let threadRepositoryFindMock: jest.Mock;
  let threadRepositoryFindOneMock: jest.Mock;
  let messageRepositoryFindMock: jest.Mock;
  let messageRawManyResult: unknown[];

  beforeEach(async () => {
    workspaceRepositoryFindOneMock = jest.fn();
    threadRepositoryFindMock = jest.fn();
    threadRepositoryFindOneMock = jest.fn();
    messageRepositoryFindMock = jest.fn();
    messageRawManyResult = [];

    const messageQueryBuilderMock = createMessageQueryBuilderMock(
      () => messageRawManyResult,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminPanelChatService,
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: { findOne: workspaceRepositoryFindOneMock },
        },
        {
          provide: getRepositoryToken(AgentChatThreadEntity),
          useValue: {
            find: threadRepositoryFindMock,
            findOne: threadRepositoryFindOneMock,
          },
        },
        {
          provide: getWorkspaceScopedRepositoryToken(AgentMessageEntity),
          useValue: {
            find: messageRepositoryFindMock,
            createQueryBuilder: jest.fn(() => messageQueryBuilderMock),
          },
        },
      ],
    }).compile();

    service = module.get<AdminPanelChatService>(AdminPanelChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWorkspaceChatThreads', () => {
    it('should merge message counts and default missing threads to zero', async () => {
      workspaceRepositoryFindOneMock.mockResolvedValue({
        id: 'workspace-1',
        allowImpersonation: true,
      });
      threadRepositoryFindMock.mockResolvedValue([
        { id: 'thread-1', title: 'A', conversationSize: 1000 },
        { id: 'thread-2', title: 'B', conversationSize: 2000 },
      ]);
      messageRawManyResult = [{ threadId: 'thread-1', messageCount: 7 }];

      const result = await service.getWorkspaceChatThreads('workspace-1');

      expect(result[0].messageCount).toBe(7);
      expect(result[1].messageCount).toBe(0);
    });

    it('should throw when the workspace has not enabled support access', async () => {
      workspaceRepositoryFindOneMock.mockResolvedValue({
        id: 'workspace-1',
        allowImpersonation: false,
      });

      await expect(
        service.getWorkspaceChatThreads('workspace-1'),
      ).rejects.toThrow(UserInputError);
    });
  });

  describe('getChatThreadMessages', () => {
    it('should return the hidden kickoff message with enriched parts', async () => {
      threadRepositoryFindOneMock.mockResolvedValue({
        id: 'thread-1',
        workspaceId: 'workspace-1',
        title: 'Workspace setup',
        totalInputTokens: 10,
        totalOutputTokens: 20,
        conversationSize: 1000,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
      });
      workspaceRepositoryFindOneMock.mockResolvedValue({
        id: 'workspace-1',
        allowImpersonation: true,
      });
      messageRepositoryFindMock.mockResolvedValue([
        {
          id: 'message-1',
          role: AgentMessageRole.USER,
          isHidden: true,
          createdAt: new Date('2026-01-01'),
          parts: [
            {
              type: 'text',
              orderIndex: 0,
              textContent: 'kickoff prompt',
              reasoningContent: null,
              toolName: null,
              toolCallId: null,
              toolInput: null,
              toolOutput: null,
              state: null,
              errorMessage: null,
            },
          ],
        },
        {
          id: 'message-2',
          role: AgentMessageRole.ASSISTANT,
          isHidden: false,
          createdAt: new Date('2026-01-01T01:00:00Z'),
          parts: [
            {
              type: 'tool-call',
              orderIndex: 1,
              textContent: null,
              reasoningContent: null,
              toolName: 'create_many_object_metadata',
              toolCallId: 'call-1',
              toolInput: { objects: [] },
              toolOutput: { success: true },
              state: 'output-available',
              errorMessage: null,
            },
            {
              type: 'reasoning',
              orderIndex: 0,
              textContent: null,
              reasoningContent: 'thinking',
              toolName: null,
              toolCallId: null,
              toolInput: null,
              toolOutput: null,
              state: null,
              errorMessage: null,
            },
          ],
        },
      ]);

      const result = await service.getChatThreadMessages('thread-1');

      expect(messageRepositoryFindMock).toHaveBeenCalledWith(
        'workspace-1',
        expect.objectContaining({ where: { threadId: 'thread-1' } }),
      );
      expect(result.thread.messageCount).toBe(1);
      expect(result.messages[0].isHidden).toBe(true);
      expect(result.messages[1].parts.map((part) => part.orderIndex)).toEqual([
        0, 1,
      ]);
      expect(result.messages[1].parts[1]).toEqual(
        expect.objectContaining({
          toolName: 'create_many_object_metadata',
          toolInput: { objects: [] },
          toolOutput: { success: true },
          state: 'output-available',
        }),
      );
    });

    it('should throw when the thread workspace has not enabled support access', async () => {
      threadRepositoryFindOneMock.mockResolvedValue({
        id: 'thread-1',
        workspaceId: 'workspace-1',
      });
      workspaceRepositoryFindOneMock.mockResolvedValue({
        id: 'workspace-1',
        allowImpersonation: false,
      });

      await expect(service.getChatThreadMessages('thread-1')).rejects.toThrow(
        UserInputError,
      );
    });
  });
});
