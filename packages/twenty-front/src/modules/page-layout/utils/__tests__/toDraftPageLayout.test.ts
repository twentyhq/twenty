import { type PageLayout } from '@/page-layout/types/PageLayout';
import { toDraftPageLayout } from '@/page-layout/utils/toDraftPageLayout';
import { PageLayoutType } from '~/generated-metadata/graphql';

const PAGE_LAYOUT = {
  __typename: 'PageLayout',
  id: 'layout-1',
  name: 'Dashboard',
  type: PageLayoutType.DASHBOARD,
  objectMetadataId: null,
  tabs: [],
  defaultTabToFocusOnMobileAndSidePanelId: 'tab-1',
  isFirstTabPinned: false,
  dashboardFilters: [
    { id: 'date-slot', label: 'Date', filterType: 'DATE_TIME' as const },
  ],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  deletedAt: null,
} as unknown as PageLayout;

describe('toDraftPageLayout', () => {
  it('keeps the fields the draft edits, dashboard filter slots included', () => {
    expect(toDraftPageLayout(PAGE_LAYOUT)).toEqual({
      id: 'layout-1',
      name: 'Dashboard',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      tabs: [],
      defaultTabToFocusOnMobileAndSidePanelId: 'tab-1',
      isFirstTabPinned: false,
      dashboardFilters: PAGE_LAYOUT.dashboardFilters,
    });
  });

  it('keeps null slots as null so the built-ins stay in effect', () => {
    expect(
      toDraftPageLayout({ ...PAGE_LAYOUT, dashboardFilters: null })
        .dashboardFilters,
    ).toBeNull();
  });
});
