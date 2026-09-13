import { describe, expect, it } from 'vitest';

import { readPersonResponseError } from 'src/logic-functions/data/read-person-response-error.util';

describe('readPersonResponseError', () => {
  it('should report a response Google did not return at all', () => {
    expect(readPersonResponseError(undefined)).toBe(
      'missing from the batch response',
    );
  });

  it('should report no error when the status is absent', () => {
    expect(readPersonResponseError({})).toBeUndefined();
  });

  it('should report no error when the status code is zero', () => {
    expect(readPersonResponseError({ status: { code: 0 } })).toBeUndefined();
  });

  it('should report the status message when the contact failed', () => {
    expect(
      readPersonResponseError({ status: { code: 3, message: 'Bad etag' } }),
    ).toBe('Bad etag');
  });

  it('should fall back to the status code when no message is given', () => {
    expect(readPersonResponseError({ status: { code: 7 } })).toBe(
      'status code 7',
    );
  });
});
