import { MAX_PRERENDERED_PAGE_LAYOUT_TABS } from '@/page-layout/constants/MaxPrerenderedPageLayoutTabs';
import { computeNextPrerenderedTabIds } from '@/page-layout/utils/computeNextPrerenderedTabIds';

describe('computeNextPrerenderedTabIds', () => {
  it('appends a new tab id most recent last', () => {
    expect(
      computeNextPrerenderedTabIds({
        currentTabIds: ['tab-1'],
        tabId: 'tab-2',
      }),
    ).toEqual(['tab-1', 'tab-2']);
  });

  it('moves an already present tab id to the end', () => {
    expect(
      computeNextPrerenderedTabIds({
        currentTabIds: ['tab-1', 'tab-2'],
        tabId: 'tab-1',
      }),
    ).toEqual(['tab-2', 'tab-1']);
  });

  it('returns the same reference when the tab id is already last', () => {
    const currentTabIds = ['tab-1', 'tab-2'];

    expect(
      computeNextPrerenderedTabIds({ currentTabIds, tabId: 'tab-2' }),
    ).toBe(currentTabIds);
  });

  it('evicts the oldest tab ids beyond the cap', () => {
    const currentTabIds = Array.from(
      { length: MAX_PRERENDERED_PAGE_LAYOUT_TABS },
      (_, index) => `tab-${index}`,
    );

    const nextTabIds = computeNextPrerenderedTabIds({
      currentTabIds,
      tabId: 'tab-new',
    });

    expect(nextTabIds).toHaveLength(MAX_PRERENDERED_PAGE_LAYOUT_TABS);
    expect(nextTabIds.at(0)).toBe('tab-1');
    expect(nextTabIds.at(-1)).toBe('tab-new');
  });
});
