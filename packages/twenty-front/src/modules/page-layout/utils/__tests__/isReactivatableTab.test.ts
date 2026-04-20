import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { isReactivatableTab } from '@/page-layout/utils/isReactivatableTab';

const makeTab = (overrides: Partial<PageLayoutTab> = {}): PageLayoutTab =>
  ({
    id: 'tab-1',
    applicationId: 'app-1',
    title: 'Tab',
    isActive: true,
    position: 0,
    pageLayoutId: '',
    widgets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    ...overrides,
  }) as unknown as PageLayoutTab;

describe('isReactivatableTab', () => {
  it('should return true when tab is inactive', () => {
    const tab = makeTab({ isActive: false });

    expect(isReactivatableTab(tab)).toBe(true);
  });

  it('should return false when tab is active', () => {
    const tab = makeTab({ isActive: true });

    expect(isReactivatableTab(tab)).toBe(false);
  });
});
