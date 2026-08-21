import { describe, expect, it } from 'vitest';

import { isUniqueViolationError } from 'src/utils/is-unique-violation-error';

describe('isUniqueViolationError', () => {
  it('detects common unique-violation phrasings (case-insensitive)', () => {
    expect(
      isUniqueViolationError(
        new Error('duplicate key value violates unique constraint'),
      ),
    ).toBe(true);
    expect(isUniqueViolationError(new Error('Record already exists'))).toBe(
      true,
    );
    expect(isUniqueViolationError({ message: 'Uniqueness violated' })).toBe(
      true,
    );
    expect(isUniqueViolationError('VIOLATES UNIQUE index')).toBe(true);
  });

  it('returns false for unrelated errors and non-error values', () => {
    expect(isUniqueViolationError(new Error('network down'))).toBe(false);
    expect(isUniqueViolationError(null)).toBe(false);
    expect(isUniqueViolationError(undefined)).toBe(false);
    expect(isUniqueViolationError(42)).toBe(false);
  });

  it("detects Twenty's user-friendly duplicate phrasing in graphQLErrors", () => {
    expect(
      isUniqueViolationError({
        message: 'Response not successful',
        graphQLErrors: [
          {
            message: 'A duplicate entry was detected',
            extensions: {
              code: 'BAD_USER_INPUT',
              userFriendlyMessage:
                'This domain name value is already in use. Please check your data.',
            },
          },
        ],
      }),
    ).toBe(true);
  });

  it('detects the structured DUPLICATE_ENTRY_DETECTED extensions code', () => {
    expect(
      isUniqueViolationError({
        message: 'whatever',
        extensions: { code: 'DUPLICATE_ENTRY_DETECTED' },
      }),
    ).toBe(true);
  });

  it('does not throw on a circular error object', () => {
    const circular: Record<string, unknown> = { message: 'boom' };
    circular.self = circular;

    expect(() => isUniqueViolationError(circular)).not.toThrow();
    expect(isUniqueViolationError(circular)).toBe(false);
  });

  it('finds the duplicate signal even on a circular error object', () => {
    const circular: Record<string, unknown> = {
      message: 'duplicate key value',
    };
    circular.self = circular;

    expect(isUniqueViolationError(circular)).toBe(true);
  });
});
