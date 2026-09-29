import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { ASK_QUESTIONS_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/ask-questions.pausing-tool';
import { findAwaitingPausingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool-parts.util';

const QUESTIONS = [{ header: 'h', question: 'q', options: [] }];

const toolPart = ({
  toolName,
  status,
  toolCallId = 'call-1',
}: {
  toolName: string;
  status: 'pending' | 'answered';
  toolCallId?: string;
}): ExtendedUIMessagePart =>
  ({
    type: `tool-${toolName}`,
    toolCallId,
    state: 'output-available',
    input: { questions: QUESTIONS },
    output: { success: true, result: { questions: QUESTIONS, status } },
  }) as unknown as ExtendedUIMessagePart;

const textPart = { type: 'text', text: 'hello' } as ExtendedUIMessagePart;

describe('findAwaitingPausingToolParts', () => {
  it('finds the pausing tool call still waiting on an output', () => {
    expect(
      findAwaitingPausingToolParts([
        textPart,
        toolPart({ toolName: 'ask_questions', status: 'pending' }),
      ]),
    ).toEqual([
      {
        toolName: 'ask_questions',
        toolCallId: 'call-1',
        input: { questions: QUESTIONS },
        pausingTool: ASK_QUESTIONS_PAUSING_TOOL,
      },
    ]);
  });

  it('finds every waiting call of a step, in the order they were made', () => {
    expect(
      findAwaitingPausingToolParts([
        toolPart({
          toolName: 'ask_questions',
          status: 'pending',
          toolCallId: 'call-1',
        }),
        toolPart({
          toolName: 'ask_questions',
          status: 'answered',
          toolCallId: 'call-2',
        }),
        toolPart({
          toolName: 'ask_questions',
          status: 'pending',
          toolCallId: 'call-3',
        }),
      ]).map((awaitingPart) => awaitingPart.toolCallId),
    ).toEqual(['call-1', 'call-3']);
  });

  it('ignores a pausing tool call already answered', () => {
    expect(
      findAwaitingPausingToolParts([
        toolPart({ toolName: 'ask_questions', status: 'answered' }),
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
