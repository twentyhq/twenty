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
  it('should return true when tab is inactive and applicationId matches', () => {
    const tab = makeTab({ isActive: false, applicationId: 'app-1' });

    expect(isReactivatableTab({ tab, objectApplicationId: 'app-1' })).toBe(
      true,
    );
  });

  it('should return false when tab is active', () => {
    const tab = makeTab({ isActive: true, applicationId: 'app-1' });

    expect(isReactivatableTab({ tab, objectApplicationId: 'app-1' })).toBe(
      false,
    );
  });

  it('should return false when applicationId does not match', () => {
    const tab = makeTab({ isActive: false, applicationId: 'app-1' });

    expect(isReactivatableTab({ tab, objectApplicationId: 'app-2' })).toBe(
      false,
    );
  });

  it('should return false when objectApplicationId is undefined', () => {
    const tab = makeTab({ isActive: false, applicationId: 'app-1' });

    expect(isReactivatableTab({ tab, objectApplicationId: undefined })).toBe(
      false,
    );
  });
});
