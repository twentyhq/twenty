import { FieldActorSource } from 'twenty-shared/types';
import { In } from 'typeorm';

import { AgentRunsService } from 'src/engine/metadata-modules/ai/ai-agent-runs/services/agent-runs.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

const buildTurn = ({
  id,
  deletedAt = null,
}: {
  id: string;
  deletedAt?: string | null;
}) => ({
  id,
  threadId: `thread-of-${id}`,
  status: AgentTurnStatus.COMPLETED,
  error: null,
  createdAt: '2026-10-05T10:00:00.000Z',
  startedAt: null,
  endedAt: null,
  modelId: null,
  inputTokens: null,
  outputTokens: null,
  inputCredits: null,
  outputCredits: null,
  createdBy: {
    source: FieldActorSource.APPLICATION,
    name: 'App',
    workspaceMemberId: null,
    context: {},
  },
  thread: { title: null, deletedAt },
});

const buildService = ({
  turns,
  messages,
  parts,
  readableThreadIds = [],
}: {
  turns: unknown[];
  messages: unknown[];
  parts: unknown[];
  readableThreadIds?: string[];
}) => {
  const turnRepository = { find: jest.fn().mockResolvedValue(turns) };
  const messageRepository = { find: jest.fn().mockResolvedValue(messages) };
  const messagePartRepository = { find: jest.fn().mockResolvedValue(parts) };
  const agentChatSharingService = {
    findReadableThreadIds: jest.fn(
      async ({ threadIds }: { threadIds: string[] }) =>
        readableThreadIds.filter((threadId) => threadIds.includes(threadId)),
    ),
  };

  return {
    service: new AgentRunsService(
      turnRepository as never,
      messageRepository as never,
      messagePartRepository as never,
      agentChatSharingService as never,
    ),
    turnRepository,
    messageRepository,
    messagePartRepository,
    agentChatSharingService,
  };
};

describe('AgentRunsService', () => {
  it('gives each run the messages and parts of its own turn', async () => {
    const { service, messageRepository, messagePartRepository } = buildService({
      turns: [buildTurn({ id: 'turn-a' }), buildTurn({ id: 'turn-b' })],
      messages: [
        {
          id: 'message-a',
          turnId: 'turn-a',
          role: 'user',
          createdAt: '2026-10-05T10:00:00.000Z',
        },
        {
          id: 'message-b',
          turnId: 'turn-b',
          role: 'user',
          createdAt: '2026-10-05T10:00:00.000Z',
        },
      ],
      parts: [
        {
          id: 'part-a',
          messageId: 'message-a',
          orderIndex: 0,
          type: 'text',
          textContent: 'First input',
          toolName: null,
        },
        {
          id: 'part-b',
          messageId: 'message-b',
          orderIndex: 0,
          type: 'text',
          textContent: 'Second input',
          toolName: null,
        },
      ],
    });

    const runs = await service.findAgentRuns({
      workspaceId: 'workspace-id',
      workspaceMemberId: 'member-id',
      agentId: 'agent-id',
      limit: 10,
    });

    expect(runs.map((run) => run.input)).toEqual([
      'First input',
      'Second input',
    ]);
    expect(messageRepository.find).toHaveBeenCalledWith(
      'workspace-id',
      expect.objectContaining({ where: { turnId: In(['turn-a', 'turn-b']) } }),
    );
    const [partWorkspaceId, partQuery] =
      messagePartRepository.find.mock.calls[0];

    expect(partWorkspaceId).toBe('workspace-id');
    expect(partQuery.select).not.toContain('toolInput');
    expect(partQuery.select).not.toContain('toolOutput');
  });

  it('reads no messages when the agent has no runs', async () => {
    const { service, messageRepository, messagePartRepository } = buildService({
      turns: [],
      messages: [],
      parts: [],
    });

    expect(
      await service.findAgentRuns({
        workspaceId: 'workspace-id',
        workspaceMemberId: 'member-id',
        agentId: 'agent-id',
        limit: 10,
      }),
    ).toEqual([]);
    expect(messageRepository.find).not.toHaveBeenCalled();
    expect(messagePartRepository.find).not.toHaveBeenCalled();
  });

  it('flags only the conversations the member can open', async () => {
    const { service, agentChatSharingService } = buildService({
      turns: [buildTurn({ id: 'turn-a' }), buildTurn({ id: 'turn-b' })],
      messages: [],
      parts: [],
      readableThreadIds: ['thread-of-turn-a'],
    });

    const runs = await service.findAgentRuns({
      workspaceId: 'workspace-id',
      workspaceMemberId: 'member-id',
      agentId: 'agent-id',
      limit: 10,
    });

    expect(runs.map((run) => run.canReadThread)).toEqual([true, false]);
    expect(agentChatSharingService.findReadableThreadIds).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      workspaceMemberId: 'member-id',
      threadIds: ['thread-of-turn-a', 'thread-of-turn-b'],
    });
  });

  it('does not offer to open a deleted conversation', async () => {
    const { service, agentChatSharingService } = buildService({
      turns: [
        buildTurn({ id: 'turn-a' }),
        buildTurn({ id: 'turn-b', deletedAt: '2026-10-06T10:00:00.000Z' }),
      ],
      messages: [],
      parts: [],
      readableThreadIds: ['thread-of-turn-a', 'thread-of-turn-b'],
    });

    const runs = await service.findAgentRuns({
      workspaceId: 'workspace-id',
      workspaceMemberId: 'member-id',
      agentId: 'agent-id',
      limit: 10,
    });

    expect(runs.map((run) => run.canReadThread)).toEqual([true, false]);
    expect(agentChatSharingService.findReadableThreadIds).toHaveBeenCalledWith(
      expect.objectContaining({ threadIds: ['thread-of-turn-a'] }),
    );
  });

  it('opens no conversation for a caller without a workspace member', async () => {
    const { service, agentChatSharingService } = buildService({
      turns: [buildTurn({ id: 'turn-a' })],
      messages: [],
      parts: [],
      readableThreadIds: ['thread-of-turn-a'],
    });

    const runs = await service.findAgentRuns({
      workspaceId: 'workspace-id',
      workspaceMemberId: undefined,
      agentId: 'agent-id',
      limit: 10,
    });

    expect(runs.map((run) => run.canReadThread)).toEqual([false]);
    expect(
      agentChatSharingService.findReadableThreadIds,
    ).not.toHaveBeenCalled();
  });

  it('still lists the runs of a member without AI chat access', async () => {
    const { service, agentChatSharingService } = buildService({
      turns: [buildTurn({ id: 'turn-a' })],
      messages: [],
      parts: [],
    });

    agentChatSharingService.findReadableThreadIds.mockRejectedValue(
      new AiException('Thread not found', AiExceptionCode.THREAD_NOT_FOUND),
    );

    const runs = await service.findAgentRuns({
      workspaceId: 'workspace-id',
      workspaceMemberId: 'member-id',
      agentId: 'agent-id',
      limit: 10,
    });

    expect(runs.map((run) => run.canReadThread)).toEqual([false]);
  });
});
