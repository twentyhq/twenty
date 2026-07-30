import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { isMessagePartInProgress } from '@/ai/utils/isMessagePartInProgress';

const createPart = (part: Record<string, unknown>): ExtendedUIMessagePart =>
  part as unknown as ExtendedUIMessagePart;

describe('isMessagePartInProgress', () => {
  it('should detect streaming text and reasoning parts as in progress', () => {
    expect(
      isMessagePartInProgress(
        createPart({ type: 'text', text: 'partial', state: 'streaming' }),
      ),
    ).toBe(true);
    expect(
      isMessagePartInProgress(
        createPart({ type: 'text', text: 'full', state: 'done' }),
      ),
    ).toBe(false);
    expect(
      isMessagePartInProgress(createPart({ type: 'text', text: 'persisted' })),
    ).toBe(false);
    expect(
      isMessagePartInProgress(
        createPart({ type: 'reasoning', text: 'partial', state: 'streaming' }),
      ),
    ).toBe(true);
    expect(
      isMessagePartInProgress(
        createPart({ type: 'reasoning', text: 'full', state: 'done' }),
      ),
    ).toBe(false);
  });

  it('should detect tool parts awaiting their output as in progress', () => {
    expect(
      isMessagePartInProgress(
        createPart({
          type: 'tool-web_search',
          toolCallId: 'tool-1',
          input: { query: 'crm software' },
          state: 'input-available',
        }),
      ),
    ).toBe(true);
    expect(
      isMessagePartInProgress(
        createPart({
          type: 'dynamic-tool',
          toolName: 'web_search',
          toolCallId: 'tool-2',
          input: { query: 'crm software' },
          state: 'input-available',
        }),
      ),
    ).toBe(true);
    expect(
      isMessagePartInProgress(
        createPart({
          type: 'tool-web_search',
          toolCallId: 'tool-3',
          input: { query: 'crm software' },
          output: { result: { ok: true } },
          state: 'output-available',
        }),
      ),
    ).toBe(false);
    expect(
      isMessagePartInProgress(
        createPart({
          type: 'tool-web_search',
          toolCallId: 'tool-4',
          input: { query: 'crm software' },
          errorText: 'Tool execution failed',
          state: 'output-error',
        }),
      ),
    ).toBe(false);
  });

  it('should detect loading routing status and running code execution as in progress', () => {
    expect(
      isMessagePartInProgress(
        createPart({
          type: 'data-routing-status',
          data: { text: 'Routing', state: 'loading' },
        }),
      ),
    ).toBe(true);
    expect(
      isMessagePartInProgress(
        createPart({
          type: 'data-routing-status',
          data: { text: 'Routed', state: 'routed' },
        }),
      ),
    ).toBe(false);
    expect(
      isMessagePartInProgress(
        createPart({
          type: 'data-code-execution',
          data: { executionId: 'exec-1', state: 'pending' },
        }),
      ),
    ).toBe(true);
    expect(
      isMessagePartInProgress(
        createPart({
          type: 'data-code-execution',
          data: { executionId: 'exec-2', state: 'running' },
        }),
      ),
    ).toBe(true);
    expect(
      isMessagePartInProgress(
        createPart({
          type: 'data-code-execution',
          data: { executionId: 'exec-3', state: 'completed' },
        }),
      ),
    ).toBe(false);
  });

  it('should treat structural parts as not in progress', () => {
    expect(isMessagePartInProgress(createPart({ type: 'step-start' }))).toBe(
      false,
    );
    expect(
      isMessagePartInProgress(
        createPart({ type: 'data-compaction', data: {} }),
      ),
    ).toBe(false);
  });
});
