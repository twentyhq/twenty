import { getCoreAgentShowPageTabs } from '@/object-core/agents/utils/getCoreAgentShowPageTabs';

describe('getCoreAgentShowPageTabs', () => {
  it('shows every tab and opens Overview for an agent with runs', () => {
    expect(
      getCoreAgentShowPageTabs({
        canReadCoreAgentRuns: true,
        isTurnsTabAvailable: true,
        hasRuns: true,
      }),
    ).toEqual({
      visibleTabIds: ['overview', 'settings', 'turns'],
      defaultTabId: 'overview',
    });
  });

  it('opens Settings until the agent has runs', () => {
    expect(
      getCoreAgentShowPageTabs({
        canReadCoreAgentRuns: true,
        isTurnsTabAvailable: true,
        hasRuns: false,
      }).defaultTabId,
    ).toBe('settings');
  });

  it('hides Overview from readers who cannot see runs', () => {
    expect(
      getCoreAgentShowPageTabs({
        canReadCoreAgentRuns: false,
        isTurnsTabAvailable: false,
        hasRuns: true,
      }),
    ).toEqual({ visibleTabIds: ['settings'], defaultTabId: 'settings' });
  });
});
