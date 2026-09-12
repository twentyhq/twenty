import { getUsageLimitSpenderGroups } from '@/settings/billing/utils/getUsageLimitSpenderGroups';

describe('getUsageLimitSpenderGroups', () => {
  it('keeps the groups in menu order', () => {
    const groups = getUsageLimitSpenderGroups([
      'apiKey',
      'workspace',
      'userWorkspace',
      'application',
    ]);

    expect(groups.map((group) => group.id)).toEqual([
      'workspace',
      'user',
      'application',
      'apiKey',
    ]);
  });

  it('drops a group the resource does not accept', () => {
    const groups = getUsageLimitSpenderGroups(['workspace', 'apiKey']);

    expect(groups.map((group) => group.id)).toEqual(['workspace', 'apiKey']);
  });

  it('returns nothing when no spender is allowed', () => {
    expect(getUsageLimitSpenderGroups([])).toEqual([]);
  });
});
