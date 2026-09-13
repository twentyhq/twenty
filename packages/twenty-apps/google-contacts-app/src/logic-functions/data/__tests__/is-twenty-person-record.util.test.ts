import { describe, expect, it } from 'vitest';

import { isTwentyPersonRecord } from 'src/logic-functions/data/is-twenty-person-record.util';

describe('isTwentyPersonRecord', () => {
  it('should accept a node carrying an id', () => {
    expect(isTwentyPersonRecord({ id: 'c0ffee' })).toBe(true);
  });

  it('should reject a node without an id', () => {
    expect(isTwentyPersonRecord({ name: { firstName: 'John' } })).toBe(false);
  });

  it('should reject a node whose id is empty', () => {
    expect(isTwentyPersonRecord({ id: '' })).toBe(false);
  });

  it('should reject values that are not objects', () => {
    expect(isTwentyPersonRecord(null)).toBe(false);
    expect(isTwentyPersonRecord(undefined)).toBe(false);
    expect(isTwentyPersonRecord('c0ffee')).toBe(false);
  });
});
