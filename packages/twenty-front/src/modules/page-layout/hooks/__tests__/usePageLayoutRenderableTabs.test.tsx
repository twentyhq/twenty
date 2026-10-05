import { usePageLayoutRenderableTabs } from '@/page-layout/hooks/usePageLayoutRenderableTabs';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { renderHook } from '@testing-library/react';
import { PageLayoutType } from '~/generated-metadata/graphql';

let mockIsMobile = false;
let mockWorkspaceSurfaceType: 'main' | 'side-panel' = 'main';

const homeTab: PageLayoutTab = {
  isSystemSideEffect: false,
  universalIdentifier: 'universal-identifier-mock',
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
      tabs: [homeTab],
    },
  }),
}));

jest.mock('@/page-layout/hooks/useIsPageLayoutInEditMode', () => ({
  useIsPageLayoutInEditMode: () => false,
}));

jest.mock('@/ui/layout/contexts/LayoutRenderingContext', () => ({
  useLayoutRenderingContext: () => ({
    targetRecordIdentifier: undefined,
  }),
}));

jest.mock('@/ui/layout/hooks/useWorkspaceSurface', () => ({
  useWorkspaceSurface: () => ({ type: mockWorkspaceSurfaceType }),
}));

jest.mock('twenty-ui/utilities', () => ({
  useIsMobile: () => mockIsMobile,
}));

describe('usePageLayoutRenderableTabs', () => {
  beforeEach(() => {
    mockIsMobile = false;
    mockWorkspaceSurfaceType = 'main';
  });

  it.each([
    { context: 'full record page', isMobile: false, surfaceType: 'main' },
    { context: 'mobile record page', isMobile: true, surfaceType: 'main' },
    {
      context: 'record side panel',
      isMobile: false,
      surfaceType: 'side-panel',
    },
  ] as const)(
    'uses the page layout tabs on the $context',
    ({ isMobile, surfaceType }) => {
      mockIsMobile = isMobile;
      mockWorkspaceSurfaceType = surfaceType;

      const { result } = renderHook(() => usePageLayoutRenderableTabs());

      expect(result.current.tabsToRenderInTabList).toEqual([homeTab]);
    },
  );
});
