import { FieldActorSource } from 'twenty-shared/types';

import { mapAgentTurnToAgentRun } from 'src/engine/metadata-modules/ai/ai-agent-runs/utils/map-agent-turn-to-agent-run.util';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

const baseTurn = {
  id: 'turn-id',
  threadId: 'thread-id',
  status: AgentTurnStatus.COMPLETED,
  error: null,
  createdAt: '2026-10-05T10:00:00.000Z',
  startedAt: '2026-10-05T10:00:00.000Z',
  endedAt: '2026-10-05T10:00:06.000Z',
  modelId: 'model-id',
  inputTokens: 1_200,
  outputTokens: 80,
  inputCredits: '1500000',
  outputCredits: '500000',
  createdBy: {
    source: FieldActorSource.WORKFLOW,
    name: 'Qualify inbound lead',
    workspaceMemberId: null,
    context: {},
  },
  thread: { title: 'Lead qualification' },
};

describe('mapAgentTurnToAgentRun', () => {
  it('reads the input, the last reply and the tools the agent used', () => {
    const run = mapAgentTurnToAgentRun({
      ...baseTurn,
      messages: [
        {
          role: 'assistant',
          agentId: 'agent-id',
          createdAt: '2026-10-05T10:00:02.000Z',
          parts: [
            {
              orderIndex: 0,
              type: 'text',
              textContent: 'Looking the company up.',
              toolName: null,
            },
          ],
        },
        {
          role: 'assistant',
          agentId: 'agent-id',
          createdAt: '2026-10-05T10:00:05.000Z',
          parts: [
            {
              orderIndex: 1,
              type: 'text',
              textContent: 'Qualified, tier A.',
              toolName: null,
            },
            {
              orderIndex: 0,
              type: 'tool-find_companies',
              textContent: null,
              toolName: 'find_companies',
            },
          ],
        },
        {
          role: 'user',
          agentId: null,
          createdAt: '2026-10-05T10:00:00.000Z',
          parts: [
            {
              orderIndex: 0,
              type: 'text',
              textContent: 'New signup: Priya Nair',
              toolName: null,
            },
          ],
        },
      ],
    });

    expect(run).toMatchObject({
      threadTitle: 'Lead qualification',
      status: AgentTurnStatus.COMPLETED,
      input: 'New signup: Priya Nair',
      reply: 'Qualified, tier A.',
      toolNames: ['find_companies'],
      creatorSource: FieldActorSource.WORKFLOW,
      creatorName: 'Qualify inbound lead',
      inputTokens: 1_200,
      outputTokens: 80,
      credits: 2,
    });
    expect(run.endedAt).toEqual(new Date('2026-10-05T10:00:06.000Z'));
  });

  it('reads dates the ORM returns as Date objects and leaves a blank model empty', () => {
    const run = mapAgentTurnToAgentRun({
      ...baseTurn,
      modelId: '',
      messages: [
        {
          role: 'assistant',
          agentId: 'agent-id',
          createdAt: new Date('2026-10-05T10:00:05.000Z'),
          parts: [
            {
              orderIndex: 0,
              type: 'text',
              textContent: 'Done.',
              toolName: null,
            },
          ],
        },
        {
          role: 'user',
          agentId: null,
          createdAt: new Date('2026-10-05T10:00:00.000Z'),
          parts: [
            { orderIndex: 0, type: 'text', textContent: 'Go.', toolName: null },
          ],
        },
      ],
    });

    expect(run).toMatchObject({ input: 'Go.', reply: 'Done.', modelId: null });
  });

  it('treats replies a caller handed over as input, not as the agent output', () => {
    const run = mapAgentTurnToAgentRun({
      ...baseTurn,
      status: AgentTurnStatus.FAILED,
      messages: [
        {
          role: 'user',
          agentId: null,
          createdAt: '2026-10-05T10:00:00.000Z',
          parts: [
            {
              orderIndex: 0,
              type: 'text',
              textContent: 'Who?',
              toolName: null,
            },
          ],
        },
        {
          role: 'assistant',
          agentId: null,
          createdAt: '2026-10-05T10:00:01.000Z',
          parts: [
            {
              orderIndex: 0,
              type: 'text',
              textContent: 'Acme.',
              toolName: null,
            },
          ],
        },
      ],
    });

    expect(run).toMatchObject({ input: 'Who?\n\nAcme.', reply: null });
  });

  it('leaves usage empty on a turn recorded before usage was counted', () => {
    const run = mapAgentTurnToAgentRun({
      ...baseTurn,
      inputTokens: null,
      outputTokens: null,
      inputCredits: null,
      outputCredits: null,
      messages: [],
    });

    expect(run).toMatchObject({
      inputTokens: null,
      credits: null,
      input: null,
      reply: null,
      toolNames: [],
    });
  });

  it('exposes the error of a failed turn', () => {
    const run = mapAgentTurnToAgentRun({
      ...baseTurn,
      status: AgentTurnStatus.FAILED,
      error: {
        code: 'STREAM_INTERRUPTED',
        message: 'The response was interrupted.',
      },
      messages: [],
    });

    expect(run.errorMessage).toBe('The response was interrupted.');
  });
});
