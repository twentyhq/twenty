import { getToolPartError } from '@/ai-chat/thinking-steps/utils/getToolPartError';

describe('getToolPartError', () => {
  it('reports a call that threw', () => {
    expect(
      getToolPartError({
        state: 'output-error',
        output: undefined,
        errorText: 'Timed out after 10s',
      }),
    ).toEqual({ hasError: true, errorText: 'Timed out after 10s' });
  });

  it('reports a call that returned an unsuccessful output', () => {
    expect(
      getToolPartError({
        state: 'output-available',
        output: {
          success: false,
          message: 'Invalid input',
          error: 'Select is required',
        },
        errorText: undefined,
      }),
    ).toEqual({ hasError: true, errorText: 'Select is required' });
  });

  it('falls back to the message when the output has no error', () => {
    expect(
      getToolPartError({
        state: 'output-available',
        output: { success: false, message: 'Tool is not available' },
        errorText: undefined,
      }),
    ).toEqual({ hasError: true, errorText: 'Tool is not available' });
  });

  it('treats a successful output as no error', () => {
    expect(
      getToolPartError({
        state: 'output-available',
        output: { success: true, result: {} },
        errorText: undefined,
      }),
    ).toEqual({ hasError: false });
  });
});
