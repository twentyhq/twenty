import { hasKnownUsageLimitSpender } from '@/settings/billing/utils/hasKnownUsageLimitSpender';

describe('hasKnownUsageLimitSpender', () => {
  it('keeps a limit whose spender the API named', () => {
    expect(
      hasKnownUsageLimitSpender({
        spenderId: 'a-member-id',
        spenderLabel: 'Tim Apple',
      }),
    ).toBe(true);
  });

  it('keeps a limit shared by a whole pool', () => {
    expect(
      hasKnownUsageLimitSpender({ spenderId: null, spenderLabel: null }),
    ).toBe(true);
  });

  it('drops a limit whose spender is gone', () => {
    expect(
      hasKnownUsageLimitSpender({
        spenderId: 'a-deleted-member-id',
        spenderLabel: null,
      }),
    ).toBe(false);
  });
});
