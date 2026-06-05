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
});
