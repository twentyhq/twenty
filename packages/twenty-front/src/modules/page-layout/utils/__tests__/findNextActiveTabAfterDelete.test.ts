import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { findNextActiveTabAfterDelete } from '../findNextActiveTabAfterDelete';

describe('findNextActiveTabAfterDelete', () => {
  const createMockTab = (id: string, position: number): PageLayoutTab => ({
    id,
    title: `Tab ${id}`,
    position,
    pageLayoutId: 'page-layout-1',
    widgets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  });

  it('should return the previous tab when deleting a middle tab', () => {
    const tabs = [
      createMockTab('tab-1', 0),
      createMockTab('tab-2', 1),
      createMockTab('tab-3', 2),
    ];

    const result = findNextActiveTabAfterDelete({
      tabs,
      deletedTabId: 'tab-2',
    });

    expect(result).toBe('tab-1');
  });

  it('should return the first tab when deleting the first tab', () => {
    const tabs = [
      createMockTab('tab-1', 0),
      createMockTab('tab-2', 1),
      createMockTab('tab-3', 2),
    ];

    const result = findNextActiveTabAfterDelete({
      tabs,
      deletedTabId: 'tab-1',
    });

    expect(result).toBe('tab-2');
  });

  it('should return the previous tab when deleting the last tab', () => {
    const tabs = [
      createMockTab('tab-1', 0),
      createMockTab('tab-2', 1),
      createMockTab('tab-3', 2),
    ];

    const result = findNextActiveTabAfterDelete({
      tabs,
      deletedTabId: 'tab-3',
    });

    expect(result).toBe('tab-2');
  });

  it('should return null when deleting the only tab', () => {
    const tabs = [createMockTab('tab-1', 0)];

    const result = findNextActiveTabAfterDelete({
      tabs,
      deletedTabId: 'tab-1',
    });

    expect(result).toBeNull();
  });

  it('should return null when tab is not found', () => {
    const tabs = [createMockTab('tab-1', 0), createMockTab('tab-2', 1)];

    const result = findNextActiveTabAfterDelete({
      tabs,
      deletedTabId: 'non-existent-tab',
    });

    expect(result).toBeNull();
  });

  it('should return the first remaining tab when deleting from a two-tab list (first tab)', () => {
    const tabs = [createMockTab('tab-1', 0), createMockTab('tab-2', 1)];

    const result = findNextActiveTabAfterDelete({
      tabs,
      deletedTabId: 'tab-1',
    });

    expect(result).toBe('tab-2');
  });

  it('should return the previous tab when deleting from a two-tab list (second tab)', () => {
    const tabs = [createMockTab('tab-1', 0), createMockTab('tab-2', 1)];

    const result = findNextActiveTabAfterDelete({
      tabs,
      deletedTabId: 'tab-2',
    });

    expect(result).toBe('tab-1');
  });

  it('should handle tabs with non-sequential positions', () => {
    const tabs = [
      createMockTab('tab-1', 0),
      createMockTab('tab-2', 0.5),
      createMockTab('tab-3', 2),
    ];

    const result = findNextActiveTabAfterDelete({
      tabs,
      deletedTabId: 'tab-2',
    });

    expect(result).toBe('tab-1');
  });
});
