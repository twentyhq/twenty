import { extractPeopleDataLabsErrorMessage } from 'src/engine/core-modules/company-enrichment/utils/extract-people-data-labs-error-message.util';

describe('extractPeopleDataLabsErrorMessage', () => {
  it('reads the nested People Data Labs error message', () => {
    expect(
      extractPeopleDataLabsErrorMessage({
        json: { error: { message: 'boom' } },
        httpStatus: 500,
      }),
    ).toBe('boom');
  });

  it('reads a top level error string', () => {
    expect(
      extractPeopleDataLabsErrorMessage({
        json: { error: 'rate limit' },
        httpStatus: 429,
      }),
    ).toBe('rate limit');
  });

  it('reads a top level message string', () => {
    expect(
      extractPeopleDataLabsErrorMessage({
        json: { message: 'not found' },
        httpStatus: 404,
      }),
    ).toBe('not found');
  });

  it('joins an array of error messages', () => {
    expect(
      extractPeopleDataLabsErrorMessage({
        json: { message: ['first', 'second'] },
        httpStatus: 400,
      }),
    ).toBe('first; second');
  });

  it('falls back to a generic message when none is present', () => {
    expect(
      extractPeopleDataLabsErrorMessage({ json: {}, httpStatus: 503 }),
    ).toBe('PDL request failed (HTTP 503).');
  });
});
