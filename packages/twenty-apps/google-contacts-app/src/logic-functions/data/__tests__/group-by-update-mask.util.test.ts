import { describe, expect, it } from 'vitest';

import { groupByUpdateMask } from 'src/logic-functions/data/group-by-update-mask.util';

describe('groupByUpdateMask', () => {
  it('should group contacts carrying the same fields under one mask', () => {
    const first = { contact: { names: [{ givenName: 'John' }] } };
    const second = { contact: { names: [{ givenName: 'Jane' }] } };

    expect([...groupByUpdateMask([first, second])]).toEqual([
      ['names', [first, second]],
    ]);
  });

  it('should keep contacts carrying different fields apart', () => {
    const withName = { contact: { names: [{ givenName: 'John' }] } };
    const withEmail = { contact: { emailAddresses: [{ value: 'a@b.co' }] } };

    const groups = groupByUpdateMask([withName, withEmail]);

    expect(groups.get('names')).toEqual([withName]);
    expect(groups.get('emailAddresses')).toEqual([withEmail]);
  });

  it('should build the same mask whatever the field order', () => {
    const namesFirst = { contact: { names: [], urls: [] } };
    const urlsFirst = { contact: { urls: [], names: [] } };

    expect([...groupByUpdateMask([namesFirst, urlsFirst]).keys()]).toEqual([
      'names,urls',
    ]);
  });

  it('should return no group for no contact', () => {
    expect(groupByUpdateMask([]).size).toBe(0);
  });
});
