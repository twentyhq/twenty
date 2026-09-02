import { describe, expect, it } from 'vitest';

import { escapeSqlLikePattern } from 'src/logic-functions/utils/escape-sql-like-pattern.util';

describe('escapeSqlLikePattern', () => {
  it('should leave a plain email untouched', () => {
    expect(escapeSqlLikePattern('ada@twenty.com')).toBe('ada@twenty.com');
  });

  it('should escape underscores', () => {
    expect(escapeSqlLikePattern('john_doe@twenty.com')).toBe(
      'john\\_doe@twenty.com',
    );
  });

  it('should escape percent signs and backslashes', () => {
    expect(escapeSqlLikePattern('a%b\\c')).toBe('a\\%b\\\\c');
  });
});
