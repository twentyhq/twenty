import { describe, expect, it } from 'vitest';

import { splitFullName } from 'src/logic-functions/data/split-full-name.util';

describe('splitFullName', () => {
  it('keeps the first word as first name and the rest as last name', () => {
    expect(splitFullName(' Ada  King Lovelace ')).toEqual({
      firstName: 'Ada',
      lastName: 'King Lovelace',
    });
  });

  it('returns nothing for a blank name', () => {
    expect(splitFullName('   ')).toBeUndefined();
  });
});
