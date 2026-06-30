import { describe, expect, it } from 'vitest';

import { extractPdlErrorMessage } from 'src/logic-functions/utils/extract-pdl-error-message';

describe('extractPdlErrorMessage', () => {
  it('reads the nested PDL error message', () => {
    expect(
      extractPdlErrorMessage({ json: { error: { message: 'boom' } }, httpStatus: 500 }),
    ).toBe('boom');
  });

  it('falls back to a generic message when none is present', () => {
    expect(extractPdlErrorMessage({ json: {}, httpStatus: 503 })).toBe(
      'PDL request failed (HTTP 503).',
    );
  });
});
