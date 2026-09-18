import { describe, expect, it } from 'vitest';

import { toPdlOutcomeErrorMessage } from 'src/logic-functions/utils/to-pdl-outcome-error-message';

describe('toPdlOutcomeErrorMessage', () => {
  it.each([401, 402])(
    'hides the People Data Labs message behind the access message on an HTTP %i error',
    (httpStatus) => {
      expect(
        toPdlOutcomeErrorMessage({
          outcome: 'error',
          httpStatus,
          message: 'Invalid API key',
        }),
      ).toBe(
        'People Data Labs enrichment is unavailable. Contact your workspace admin.',
      );
    },
  );

  it('keeps the People Data Labs message for any other error', () => {
    expect(
      toPdlOutcomeErrorMessage({
        outcome: 'error',
        httpStatus: 429,
        message: 'Rate limited',
      }),
    ).toBe('Rate limited');
  });

  it('reports a missing outcome', () => {
    expect(toPdlOutcomeErrorMessage(undefined)).toBe(
      'People Data Labs returned no response for this record.',
    );
  });
});
