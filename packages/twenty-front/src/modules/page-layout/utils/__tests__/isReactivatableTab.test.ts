import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { isReactivatableTab } from '@/page-layout/utils/isReactivatableTab';

describe('isReactivatableTab', () => {
  it('should return true when tab is inactive', () => {
    const tab = makeTab('tab-1', [], 0, undefined, { isActive: false });

    expect(isReactivatableTab(tab)).toBe(true);
  });

  it('should return false when tab is active', () => {
    const tab = makeTab('tab-1', [], 0, undefined, { isActive: true });

    expect(isReactivatableTab(tab)).toBe(false);
  });
});
