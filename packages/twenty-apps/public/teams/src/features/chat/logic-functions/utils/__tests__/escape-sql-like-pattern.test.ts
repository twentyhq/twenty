import { describe, expect, it } from 'vitest';

import { escapeSqlLikePattern } from 'src/features/chat/logic-functions/utils/escape-sql-like-pattern';

describe('escapeSqlLikePattern', () => {
  it('should leave a plain email untouched', () => {
    expect(escapeSqlLikePattern('jane@acme.com')).toBe('jane@acme.com');
  });

  it('should escape underscores', () => {
    expect(escapeSqlLikePattern('jane_doe@acme.com')).toBe(
      'jane\\_doe@acme.com',
    );
  });

  it('should escape percent signs and backslashes', () => {
    expect(escapeSqlLikePattern('a%b\\c')).toBe('a\\%b\\\\c');
  });
});
