import { isThinkingStepPartActive } from '@/ai-chat/thinking-steps/utils/isThinkingStepPartActive';
import { type ThinkingStepPart } from '@/ai-chat/thinking-steps/types/ThinkingStepPart';

const createReasoningPart = ({
  state = 'done',
  text = 'Reasoning content',
}: {
  state?: string;
  text?: string;
} = {}): ThinkingStepPart =>
  ({
    type: 'reasoning',
    text,
    state,
  }) as ThinkingStepPart;

const createToolPart = ({
  errorText,
  input = {},
  output,
  state = 'output-available',
  type = 'tool-web_search',
}: {
  type?: `tool-${string}`;
  input?: Record<string, unknown>;
  output?: unknown;
  errorText?: string;
  state?: string;
} = {}): ThinkingStepPart =>
  ({
    type,
    toolCallId: 'tool-call-id',
    input,
    output,
    errorText,
    state,
  }) as ThinkingStepPart;

describe('isThinkingStepPartActive', () => {
  it('should mark streaming reasoning parts as active', () => {
    const reasoningPart = createReasoningPart({ state: 'streaming' });

    expect(isThinkingStepPartActive(reasoningPart, false)).toBe(true);
  });

  it('should mark tool parts awaiting their output as active while message is streaming', () => {
    const toolPart = createToolPart({
      type: 'tool-web_search',
      state: 'input-available',
    });

    expect(isThinkingStepPartActive(toolPart, true)).toBe(true);
    expect(isThinkingStepPartActive(toolPart, false)).toBe(false);
  });

  it('should mark completed and failed tool parts as inactive', () => {
    const completedToolPart = createToolPart({
      output: { result: { ok: true } },
    });
    const completedNullOutputToolPart = createToolPart({
      output: null,
    });
    const failedToolPart = createToolPart({
      errorText: 'Tool failed',
      state: 'output-error',
    });

    expect(isThinkingStepPartActive(completedToolPart, true)).toBe(false);
    expect(isThinkingStepPartActive(completedNullOutputToolPart, true)).toBe(
      false,
    );
    expect(isThinkingStepPartActive(failedToolPart, true)).toBe(false);
  });
});
