import { getUsageLimitSpenderName } from '@/settings/billing/utils/getUsageLimitSpenderName';

describe('getUsageLimitSpenderName', () => {
  it('uses the resolved name when the limit targets one spender', () => {
    expect(
      getUsageLimitSpenderName({
        spenderType: 'userWorkspace',
        spenderLabel: 'Tim Apple',
      }),
    ).toBe('Tim Apple');
  });

  it('names the pool when every spender of the type shares the limit', () => {
    expect(
      getUsageLimitSpenderName({
        spenderType: 'userWorkspace',
        spenderLabel: null,
      }),
    ).toBe('All users');
    expect(
      getUsageLimitSpenderName({ spenderType: 'apiKey', spenderLabel: null }),
    ).toBe('All API keys');
  });

  it('does not pass a limit off as pool-wide when its spender no longer resolves', () => {
    expect(
      getUsageLimitSpenderName({
        spenderType: 'userWorkspace',
        spenderId: 'deleted-member-id',
        spenderLabel: null,
      }),
    ).toBe('Unknown spender');
  });

  it('speaks of the workspace itself for a workspace-wide limit', () => {
    expect(
      getUsageLimitSpenderName({
        spenderType: 'workspace',
        spenderLabel: null,
      }),
    ).toBe('The whole workspace');
  });

  it('falls back to the raw type when the API sends an unknown one', () => {
    expect(
      getUsageLimitSpenderName({ spenderType: 'martian', spenderLabel: null }),
    ).toBe('martian');
  });
});
