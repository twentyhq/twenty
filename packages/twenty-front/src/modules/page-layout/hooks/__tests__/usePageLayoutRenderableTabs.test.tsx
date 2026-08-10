import { usePageLayoutRenderableTabs } from '@/page-layout/hooks/usePageLayoutRenderableTabs';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { renderHook } from '@testing-library/react';
import { PageLayoutType } from '~/generated-metadata/graphql';

let mockIsMobile = false;
let mockIsInSidePanel = false;

const featureFilteredHomeTab: PageLayoutTab = {
  id: 'home-tab-id',
  applicationId: 'application-id',
  isActive: true,
  pageLayoutId: 'page-layout-id',
  title: 'Home',
  position: 0,
  widgets: [],
  createdAt: '2026-08-07T00:00:00.000Z',
  updatedAt: '2026-08-07T00:00:00.000Z',
};

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));

jest.mock('@/page-layout/hooks/useCurrentPageLayoutOrThrow', () => ({
  useCurrentPageLayoutOrThrow: () => ({
    currentPageLayout: {
      id: 'page-layout-id',
      type: PageLayoutType.RECORD_PAGE,
    },
  }),
}));

jest.mock('@/page-layout/hooks/useIsPageLayoutInEditMode', () => ({
  useIsPageLayoutInEditMode: () => false,
}));

jest.mock(
  '@/page-layout/hooks/usePageLayoutTabsFilteredByFeatureFlags',
  () => ({
    usePageLayoutTabsFilteredByFeatureFlags: () => ({
      featureFilteredPageLayoutTabs: [featureFilteredHomeTab],
    }),
  }),
);

jest.mock('@/ui/layout/contexts/LayoutRenderingContext', () => ({
  useLayoutRenderingContext: () => ({
    isInSidePanel: mockIsInSidePanel,
    targetRecordIdentifier: undefined,
  }),
}));

jest.mock('twenty-ui/utilities', () => ({
  useIsMobile: () => mockIsMobile,
}));

describe('usePageLayoutRenderableTabs', () => {
  beforeEach(() => {
    mockIsMobile = false;
    mockIsInSidePanel = false;
  });

  it.each([
    { context: 'full record page', isMobile: false, isInSidePanel: false },
    { context: 'mobile record page', isMobile: true, isInSidePanel: false },
    { context: 'record side panel', isMobile: false, isInSidePanel: true },
  ])(
    'uses the feature-filtered tabs on the $context',
    ({ isMobile, isInSidePanel }) => {
      mockIsMobile = isMobile;
      mockIsInSidePanel = isInSidePanel;

      const { result } = renderHook(() => usePageLayoutRenderableTabs());

      expect(result.current.tabsToRenderInTabList).toEqual([
        featureFilteredHomeTab,
      ]);
    },
  );
});
