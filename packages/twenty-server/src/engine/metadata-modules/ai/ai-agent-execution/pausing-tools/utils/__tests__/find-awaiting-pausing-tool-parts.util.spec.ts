import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { findAwaitingPausingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool-parts.util';

const QUESTIONS = [
  { header: 'h', question: 'q', options: [{ label: 'a' }, { label: 'b' }] },
];

const toolPart = ({
  toolName,
  status,
  toolCallId = 'call-1',
  input = QUESTIONS[0],
}: {
  toolName: string;
  status: 'pending' | 'answered';
  toolCallId?: string;
  input?: unknown;
}): ExtendedUIMessagePart =>
  ({
    type: `tool-${toolName}`,
    toolCallId,
    state: 'output-available',
    input,
    output: { success: true, result: { question: QUESTIONS[0], status } },
  }) as unknown as ExtendedUIMessagePart;

const textPart = { type: 'text', text: 'hello' } as ExtendedUIMessagePart;

describe('findAwaitingPausingToolParts', () => {
  it('finds the pausing tool call still waiting on an output', () => {
    expect(
      findAwaitingPausingToolParts([
        textPart,
        toolPart({ toolName: 'ask_question', status: 'pending' }),
      ]),
    ).toEqual([
      { toolName: 'ask_question', toolCallId: 'call-1', isAnswerable: true },
    ]);
  });

  it('finds a waiting call it cannot read, as one nobody can answer', () => {
    expect(
      findAwaitingPausingToolParts([
        toolPart({
          toolName: 'ask_question',
          status: 'pending',
          input: { questions: [] },
        }),
      ]),
    ).toEqual([
      { toolName: 'ask_question', toolCallId: 'call-1', isAnswerable: false },
    ]);
  });

  it('finds every waiting call of a step, in the order they were made', () => {
    expect(
      findAwaitingPausingToolParts([
        toolPart({
          toolName: 'ask_question',
          status: 'pending',
          toolCallId: 'call-1',
        }),
        toolPart({
          toolName: 'ask_question',
          status: 'answered',
          toolCallId: 'call-2',
        }),
        toolPart({
          toolName: 'ask_question',
          status: 'pending',
          toolCallId: 'call-3',
        }),
      ]).map((awaitingPart) => awaitingPart.toolCallId),
    ).toEqual(['call-1', 'call-3']);
  });

  it('ignores a pausing tool call already answered', () => {
    expect(
      findAwaitingPausingToolParts([
        toolPart({ toolName: 'ask_question', status: 'answered' }),
      ]),
    ).toEqual([]);
  });

  it('ignores tools that do not pause, whatever they return', () => {
    expect(
      findAwaitingPausingToolParts([
        toolPart({ toolName: 'search_help_center', status: 'pending' }),
      ]),
    ).toEqual([]);
  });
});
