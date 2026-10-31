import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import {
  type AiRunMessage,
  type AiRunTurn,
  buildAiRunEvents,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-ai-run-events.util';
import { readStreamedAgentMessage } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/read-streamed-agent-message.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-ui-message-parts-to-db-parts.util';

const APPLICATION_ACTOR = {
  type: 'application' as const,
  applicationId: 'application-id',
};
const STARTED_AT = '2026-10-31T10:00:00.000Z';
const ENDED_AT = '2026-10-31T10:00:05.000Z';

const buildTurn = (overrides: Partial<AiRunTurn> = {}): AiRunTurn => ({
  id: 'turn-id',
  status: AgentTurnStatus.COMPLETED,
  error: null,
  createdAt: STARTED_AT,
  updatedAt: ENDED_AT,
  startedAt: STARTED_AT,
  endedAt: ENDED_AT,
  inputTokens: 120,
  outputTokens: 30,
  ...overrides,
});

const buildMessage = ({
  id,
  role,
  parts,
  turnId = 'turn-id',
  senderWorkspaceMemberId = null,
  senderApplicationId = null,
}: {
  id: string;
  role: AgentMessageRole;
  parts: ExtendedUIMessagePart[];
  turnId?: string;
  senderWorkspaceMemberId?: string | null;
  senderApplicationId?: string | null;
}): AiRunMessage => ({
  id,
  turnId,
  role,
  status: AgentMessageStatus.SENT,
  createdAt: STARTED_AT,
  senderWorkspaceMemberId,
  senderApplicationId,
  parts: mapUIMessagePartsToDBParts(
    parts,
    id,
  ) as AgentMessagePartWorkspaceEntity[],
});

const PROMPT = buildMessage({
  id: 'prompt-id',
  role: AgentMessageRole.USER,
  senderApplicationId: 'application-id',
  parts: [{ type: 'text', text: 'Enrich Acme' }],
});

const FIND_COMPANY_CALL = {
  type: 'tool-find_companies',
  toolCallId: 'call-id',
  input: { name: 'Acme' },
} as const;

const REPLY_PARTS: ExtendedUIMessagePart[] = [
  { type: 'step-start' },
  { type: 'text', text: 'Looking it up.' },
  {
    ...FIND_COMPANY_CALL,
    state: 'output-available',
    output: { companies: [] },
  },
  { type: 'text', text: 'Nothing found.' },
];

describe('buildAiRunEvents', () => {
  it('lists a recorded run: start, messages, tool calls, then its end with usage', () => {
    const events = buildAiRunEvents({
      turns: [buildTurn()],
      messages: [
        PROMPT,
        buildMessage({
          id: 'reply-id',
          role: AgentMessageRole.ASSISTANT,
          parts: REPLY_PARTS,
        }),
      ],
      streamedMessage: null,
      actor: APPLICATION_ACTOR,
    }).flat();

    expect(
      events.map(({ id, type, runId, createdAt }) => ({
        id,
        type,
        runId,
        createdAt,
      })),
    ).toEqual([
      {
        id: 'turn-id:started',
        type: 'RUN_STARTED',
        runId: 'turn-id',
        createdAt: STARTED_AT,
      },
      {
        id: 'prompt-id:text:0',
        type: 'MESSAGE',
        runId: 'turn-id',
        createdAt: STARTED_AT,
      },
      {
        id: 'reply-id:text:0',
        type: 'MESSAGE',
        runId: 'turn-id',
        createdAt: STARTED_AT,
      },
      {
        id: 'call-id:call',
        type: 'TOOL_CALL',
        runId: 'turn-id',
        createdAt: STARTED_AT,
      },
      {
        id: 'call-id:result',
        type: 'TOOL_RESULT',
        runId: 'turn-id',
        createdAt: STARTED_AT,
      },
      {
        id: 'reply-id:text:1',
        type: 'MESSAGE',
        runId: 'turn-id',
        createdAt: STARTED_AT,
      },
      {
        id: 'turn-id:completed',
        type: 'RUN_COMPLETED',
        runId: 'turn-id',
        createdAt: ENDED_AT,
      },
    ]);
    expect(events[1]).toMatchObject({ role: 'user', text: 'Enrich Acme' });
    expect(events[3]).toMatchObject({
      toolName: 'find_companies',
      input: { name: 'Acme' },
    });
    expect(events[4]).toMatchObject({
      output: { companies: [] },
      isError: false,
    });
    expect(events[6]).toMatchObject({
      usage: { inputTokens: 120, outputTokens: 30 },
    });
  });

  it('lists a run without a conversation as its start and its end', () => {
    expect(
      buildAiRunEvents({
        turns: [
          buildTurn({
            status: AgentTurnStatus.FAILED,
            error: { code: 'CREDITS', message: 'Out of credits' },
            inputTokens: null,
            outputTokens: null,
          }),
        ],
        messages: [],
        streamedMessage: null,
        actor: APPLICATION_ACTOR,
      }).flat(),
    ).toEqual([
      {
        id: 'turn-id:started',
        runId: 'turn-id',
        type: 'RUN_STARTED',
        createdAt: STARTED_AT,
      },
      {
        id: 'turn-id:failed',
        runId: 'turn-id',
        type: 'RUN_FAILED',
        createdAt: ENDED_AT,
        error: 'Out of credits',
        usage: null,
      },
    ]);
  });

  it('reads a running reply from its stream, with the ids it keeps once recorded', async () => {
    const streamedMessage = await readStreamedAgentMessage([
      { type: 'start', messageId: 'reply-id' },
      { type: 'start-step' },
      { type: 'text-start', id: 'text-1' },
      { type: 'text-delta', id: 'text-1', delta: 'Looking it up.' },
      { type: 'text-end', id: 'text-1' },
      {
        type: 'tool-input-available',
        toolCallId: 'call-id',
        toolName: 'find_companies',
        input: { name: 'Acme' },
      },
      { type: 'text-start', id: 'text-2' },
      { type: 'text-delta', id: 'text-2', delta: 'Still typ' },
    ]);
    const checkpoint = buildMessage({
      id: 'reply-id',
      role: AgentMessageRole.ASSISTANT,
      parts: [{ ...FIND_COMPANY_CALL, state: 'input-available' }],
    });

    const liveEvents = buildAiRunEvents({
      turns: [buildTurn({ status: AgentTurnStatus.RUNNING, endedAt: null })],
      messages: [PROMPT, checkpoint],
      streamedMessage,
      actor: APPLICATION_ACTOR,
    }).flat();
    const recordedEvents = buildAiRunEvents({
      turns: [buildTurn()],
      messages: [
        PROMPT,
        buildMessage({
          id: 'reply-id',
          role: AgentMessageRole.ASSISTANT,
          parts: REPLY_PARTS,
        }),
      ],
      streamedMessage: null,
      actor: APPLICATION_ACTOR,
    }).flat();

    expect(liveEvents.map(({ id, type }) => `${type} ${id}`)).toEqual([
      'RUN_STARTED turn-id:started',
      'MESSAGE prompt-id:text:0',
      'MESSAGE reply-id:text:0',
      'TOOL_CALL call-id:call',
    ]);
    expect(recordedEvents.slice(0, liveEvents.length)).toEqual(liveEvents);
  });

  it('shows an interaction, and its answer once given', () => {
    const askQuestion = {
      type: 'tool-ask_question',
      toolCallId: 'question-id',
      input: { question: 'Which Acme?' },
      state: 'output-available',
    } as const;
    const buildEvents = (output: unknown) =>
      buildAiRunEvents({
        turns: [buildTurn({ status: AgentTurnStatus.WAITING_FOR_INPUT })],
        messages: [
          PROMPT,
          buildMessage({
            id: 'reply-id',
            role: AgentMessageRole.ASSISTANT,
            parts: [{ ...askQuestion, output }],
          }),
        ],
        streamedMessage: null,
        actor: APPLICATION_ACTOR,
      })
        .flat()
        .map(({ type }) => type);

    expect(
      buildEvents({ success: true, result: { status: 'pending' } }),
    ).toEqual(['RUN_STARTED', 'MESSAGE', 'INTERACTION']);
    expect(
      buildEvents({ success: true, result: { status: 'answered' } }),
    ).toEqual(['RUN_STARTED', 'MESSAGE', 'INTERACTION', 'TOOL_RESULT']);
  });

  it("hides another member's tool calls and results, keeping their text", () => {
    const events = buildAiRunEvents({
      turns: [buildTurn()],
      messages: [
        buildMessage({
          id: 'prompt-id',
          role: AgentMessageRole.USER,
          senderWorkspaceMemberId: 'other-member-id',
          parts: [{ type: 'text', text: 'Enrich Acme' }],
        }),
        buildMessage({
          id: 'reply-id',
          role: AgentMessageRole.ASSISTANT,
          parts: REPLY_PARTS,
        }),
      ],
      streamedMessage: null,
      actor: { type: 'user', workspaceMemberId: 'member-id' },
    }).flat();

    expect(events.map(({ type }) => type)).toEqual([
      'RUN_STARTED',
      'MESSAGE',
      'MESSAGE',
      'MESSAGE',
      'RUN_COMPLETED',
    ]);
  });

  it('groups events by model step, the unit in which tool results can come out of order', () => {
    const steps = buildAiRunEvents({
      turns: [buildTurn()],
      messages: [
        PROMPT,
        buildMessage({
          id: 'reply-id',
          role: AgentMessageRole.ASSISTANT,
          parts: [
            { type: 'step-start' },
            {
              ...FIND_COMPANY_CALL,
              toolCallId: 'call-a',
              state: 'output-available',
              output: { companies: [] },
            },
            {
              ...FIND_COMPANY_CALL,
              toolCallId: 'call-b',
              state: 'output-available',
              output: { companies: [] },
            },
            { type: 'step-start' },
            { type: 'text', text: 'Nothing found.' },
          ],
        }),
      ],
      streamedMessage: null,
      actor: APPLICATION_ACTOR,
    });

    expect(steps.map((step) => step.map(({ id }) => id))).toEqual([
      ['turn-id:started'],
      ['prompt-id:text:0'],
      ['call-a:call', 'call-a:result', 'call-b:call', 'call-b:result'],
      ['reply-id:text:0'],
      ['turn-id:completed'],
    ]);
  });
});
