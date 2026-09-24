import { describe, expect, it } from 'vitest';

import { parseSlackToolResult } from 'src/front-components/utils/parse-slack-tool-result.util';

const FALLBACK_MESSAGE = 'Could not do the thing';

describe('parseSlackToolResult', () => {
  it('should fail with the fallback message when the value is not a record', () => {
    expect(
      parseSlackToolResult({
        value: 'nope',
        fallbackMessage: FALLBACK_MESSAGE,
      }),
    ).toEqual({
      success: false,
      message: FALLBACK_MESSAGE,
      error: 'The request failed. Please try again.',
    });
  });

  it('should fail with the fallback message when success is not a boolean', () => {
    expect(
      parseSlackToolResult({
        value: { success: 'yes' },
        fallbackMessage: FALLBACK_MESSAGE,
      }),
    ).toEqual({
      success: false,
      message: FALLBACK_MESSAGE,
      error: 'The request failed. Please try again.',
    });
  });

  it('should pass through a populated result', () => {
    expect(
      parseSlackToolResult({
        value: {
          success: false,
          message: 'Not allowed',
          error: 'No permission',
        },
        fallbackMessage: FALLBACK_MESSAGE,
      }),
    ).toEqual({
      success: false,
      message: 'Not allowed',
      error: 'No permission',
    });
  });

  it('should default non-string message and error fields', () => {
    expect(
      parseSlackToolResult({
        value: { success: true, message: 42, error: null },
        fallbackMessage: FALLBACK_MESSAGE,
      }),
    ).toEqual({ success: true, message: FALLBACK_MESSAGE, error: undefined });
  });

  it('should fall back on an empty message so the snackbar is never blank', () => {
    expect(
      parseSlackToolResult({
        value: { success: true, message: '' },
        fallbackMessage: FALLBACK_MESSAGE,
      }),
    ).toEqual({ success: true, message: FALLBACK_MESSAGE, error: undefined });
  });
});
