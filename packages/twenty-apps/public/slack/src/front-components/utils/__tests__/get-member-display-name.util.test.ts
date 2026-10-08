import { describe, expect, it } from 'vitest';

import { getMemberDisplayName } from 'src/front-components/utils/get-member-display-name.util';

describe('getMemberDisplayName', () => {
  it('should prefer the name', () => {
    expect(
      getMemberDisplayName({
        id: 'member-1',
        name: 'Ada Lovelace',
        userEmail: 'ada@twenty.com',
      }),
    ).toBe('Ada Lovelace');
  });

  it('should fall back to the email when the name is empty', () => {
    expect(
      getMemberDisplayName({
        id: 'member-1',
        name: '',
        userEmail: 'ada@twenty.com',
      }),
    ).toBe('ada@twenty.com');
  });

  it('should fall back to the id when name and email are empty', () => {
    expect(
      getMemberDisplayName({ id: 'member-1', name: '', userEmail: null }),
    ).toBe('member-1');
  });
});
