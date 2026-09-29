import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { ASK_QUESTIONS_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/ask-questions.pausing-tool';
import { findAwaitingPausingToolPart } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool-part.util';

const QUESTIONS = [{ header: 'h', question: 'q', options: [] }];

const toolPart = ({
  toolName,
  status,
}: {
  toolName: string;
  status: 'pending' | 'answered';
}): ExtendedUIMessagePart =>
  ({
    type: `tool-${toolName}`,
    toolCallId: 'call-1',
    state: 'output-available',
    input: { questions: QUESTIONS },
    output: { success: true, result: { questions: QUESTIONS, status } },
  }) as unknown as ExtendedUIMessagePart;

const textPart = { type: 'text', text: 'hello' } as ExtendedUIMessagePart;

describe('findAwaitingPausingToolPart', () => {
  it('finds the pausing tool call still waiting on an output', () => {
    expect(
      findAwaitingPausingToolPart([
        textPart,
        toolPart({ toolName: 'ask_questions', status: 'pending' }),
      ]),
    ).toEqual({
      toolName: 'ask_questions',
      toolCallId: 'call-1',
      input: { questions: QUESTIONS },
      pausingTool: ASK_QUESTIONS_PAUSING_TOOL,
    });
  });

  it('ignores a pausing tool call already answered', () => {
    expect(
      findAwaitingPausingToolPart([
        toolPart({ toolName: 'ask_questions', status: 'answered' }),
      ]),
    ).toBeUndefined();
  });

  it('ignores tools that do not pause, whatever they return', () => {
    expect(
      findAwaitingPausingToolPart([
        toolPart({ toolName: 'search_help_center', status: 'pending' }),
      ]),
    ).toBeUndefined();
  });
});
