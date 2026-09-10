import { getUsageLimitSpenderGroups } from '@/settings/billing/utils/getUsageLimitSpenderGroups';

describe('getUsageLimitSpenderGroups', () => {
  it('keeps the groups in menu order', () => {
    const groups = getUsageLimitSpenderGroups([
      'apiKey',
      'workspace',
      'userWorkspace',
      'agent',
    ]);

    expect(groups.map((group) => group.id)).toEqual([
      'workspace',
      'user',
      'application',
      'apiKey',
    ]);
  });

  it('keeps only the allowed sub kinds inside a group', () => {
    const groups = getUsageLimitSpenderGroups([
      'workspace',
      'application',
      'agent',
    ]);
    const applicationGroup = groups.find((group) => group.id === 'application');

    expect(applicationGroup?.spenderType).toBe('application');
    expect(applicationGroup?.subSpenderTypes).toEqual(['agent']);
  });

  it('keeps a group whose own kind is disallowed but still holds sub kinds', () => {
    const groups = getUsageLimitSpenderGroups(['workspace', 'agent']);
    const applicationGroup = groups.find((group) => group.id === 'application');

    expect(applicationGroup?.spenderType).toBeNull();
    expect(applicationGroup?.subSpenderTypes).toEqual(['agent']);
  });

  it('drops a group with neither its own kind nor sub kinds', () => {
    const groups = getUsageLimitSpenderGroups(['workspace']);

    expect(groups.map((group) => group.id)).toEqual(['workspace']);
  });

  it('returns nothing when no spender is allowed', () => {
    expect(getUsageLimitSpenderGroups([])).toEqual([]);
  });
});
