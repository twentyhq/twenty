import { describe, expect, it } from 'vitest';

import { escapeSqlLikePattern } from 'src/logic-functions/utils/escape-sql-like-pattern.util';

describe('escapeSqlLikePattern', () => {
  it('should escape the characters LIKE treats as wildcards', () => {
    expect(escapeSqlLikePattern('50%_off\\now')).toBe('50\\%\\_off\\\\now');
  });

  it('should leave a Meet code unchanged', () => {
    expect(escapeSqlLikePattern('abc-mnop-xyz')).toBe('abc-mnop-xyz');
  });
});
