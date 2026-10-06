import { FieldActorSource } from 'twenty-shared/types';
import { In } from 'typeorm';

import { AgentRunsService } from 'src/engine/metadata-modules/ai/ai-agent-runs/services/agent-runs.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

const buildTurn = (id: string) => ({
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
  thread: { title: null },
});

const buildService = ({
  turns,
  messages,
  parts,
}: {
  turns: unknown[];
  messages: unknown[];
  parts: unknown[];
}) => {
  const turnRepository = { find: jest.fn().mockResolvedValue(turns) };
  const messageRepository = { find: jest.fn().mockResolvedValue(messages) };
  const messagePartRepository = { find: jest.fn().mockResolvedValue(parts) };

  return {
    service: new AgentRunsService(
      turnRepository as never,
      messageRepository as never,
      messagePartRepository as never,
    ),
    turnRepository,
    messageRepository,
    messagePartRepository,
  };
};

describe('AgentRunsService', () => {
  it('gives each run the messages and parts of its own turn', async () => {
    const { service, messageRepository, messagePartRepository } = buildService({
      turns: [buildTurn('turn-a'), buildTurn('turn-b')],
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
        agentId: 'agent-id',
        limit: 10,
      }),
    ).toEqual([]);
    expect(messageRepository.find).not.toHaveBeenCalled();
    expect(messagePartRepository.find).not.toHaveBeenCalled();
  });
});
