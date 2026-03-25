import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import {
  type PageLayout,
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';

const makePageLayout = (overrides: Partial<PageLayout> = {}): PageLayout =>
  ({
    __typename: 'PageLayout',
    id: 'layout-1',
    name: 'Test Layout',
    type: PageLayoutType.RECORD_PAGE,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    tabs: [],
    ...overrides,
  }) as PageLayout;

describe('transformPageLayout', () => {
  it('should default tabs to empty array when null', () => {
    const layout = makePageLayout({ tabs: null as any });

    const result = transformPageLayout(layout);

    expect(result.tabs).toEqual([]);
  });

  it('should sort tabs by position', () => {
    const layout = makePageLayout({
      tabs: [
        {
          id: 'tab-2',
          position: 2,
          title: 'Second',
          pageLayoutId: 'layout-1',
          applicationId: 'app-1',
          layoutMode: PageLayoutTabLayoutMode.GRID,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
        {
          id: 'tab-1',
          position: 1,
          title: 'First',
          pageLayoutId: 'layout-1',
          applicationId: 'app-1',
          layoutMode: PageLayoutTabLayoutMode.GRID,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
      ] as any,
    });

    const result = transformPageLayout(layout);

    expect(result.tabs[0].id).toBe('tab-1');
    expect(result.tabs[1].id).toBe('tab-2');
  });

  it('should default widgets to empty array when null', () => {
    const layout = makePageLayout({
      tabs: [
        {
          id: 'tab-1',
          position: 0,
          title: 'Tab',
          pageLayoutId: 'layout-1',
          applicationId: 'app-1',
          layoutMode: PageLayoutTabLayoutMode.GRID,
          widgets: null,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
      ] as any,
    });

    const result = transformPageLayout(layout);

    expect(result.tabs[0].widgets).toEqual([]);
  });

  it('should preserve existing widgets', () => {
    const widget = {
      id: 'w1',
      title: 'Widget',
      type: 'FIELDS',
    };

    const layout = makePageLayout({
      tabs: [
        {
          id: 'tab-1',
          position: 0,
          title: 'Tab',
          pageLayoutId: 'layout-1',
          applicationId: 'app-1',
          layoutMode: PageLayoutTabLayoutMode.GRID,
          widgets: [widget],
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
      ] as any,
    });

    const result = transformPageLayout(layout);

    expect(result.tabs[0].widgets).toHaveLength(1);
    expect(result.tabs[0].widgets[0].id).toBe('w1');
  });
});
