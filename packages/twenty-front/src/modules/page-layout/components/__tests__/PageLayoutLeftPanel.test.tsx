import { PageLayoutLeftPanel } from '@/page-layout/components/PageLayoutLeftPanel';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { PageLayoutType } from '~/generated-metadata/graphql';

let mockTargetRecordIdentifier = {
  id: 'record-id',
  targetObjectNameSingular: 'company',
};
let mockIsInSidePanel = false;

jest.mock('@/object-record/record-show/components/SummaryCard', () => ({
  SummaryCard: () => null,
}));

jest.mock('@/page-layout/components/PageLayoutContent', () => ({
  PageLayoutContent: () => <div>Page layout content</div>,
}));

jest.mock('@/page-layout/hooks/useCurrentPageLayout', () => ({
  useCurrentPageLayout: () => ({
    currentPageLayout: {
      type: PageLayoutType.RECORD_PAGE,
    },
  }),
}));

jest.mock(
  '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow',
  () => ({
    usePageLayoutTabWithVisibleWidgetsOrThrow: () => ({
      id: 'pinned-tab-id',
    }),
  }),
);

jest.mock('@/page-layout/utils/getTabLayoutMode', () => ({
  getTabLayoutMode: () => 'VERTICAL_LIST',
}));

jest.mock('@/ui/layout/contexts/LayoutRenderingContext', () => ({
  useLayoutRenderingContext: () => ({
    isInSidePanel: mockIsInSidePanel,
    layoutType: PageLayoutType.RECORD_PAGE,
  }),
}));

jest.mock('@/ui/layout/contexts/useTargetRecord', () => ({
  useTargetRecord: () => mockTargetRecordIdentifier,
}));

jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({
    children,
    componentInstanceId,
  }: {
    children: ReactNode;
    componentInstanceId: string;
  }) => (
    <div
      id={`scroll-wrapper-${componentInstanceId}`}
      data-testid="pinned-scroll-wrapper"
    >
      {children}
    </div>
  ),
}));

describe('PageLayoutLeftPanel', () => {
  beforeEach(() => {
    mockTargetRecordIdentifier = {
      id: 'record-id',
      targetObjectNameSingular: 'company',
    };
    mockIsInSidePanel = false;
  });

  it('resets the pinned scroll position when the target record changes', () => {
    const { rerender } = render(
      <PageLayoutLeftPanel
        pageLayoutId="page-layout-id"
        pinnedLeftTabId="pinned-tab-id"
      />,
    );

    const scrollWrapper = screen.getByTestId('pinned-scroll-wrapper');
    scrollWrapper.scrollTop = 200;

    mockTargetRecordIdentifier = {
      ...mockTargetRecordIdentifier,
      id: 'another-record-id',
    };

    rerender(
      <PageLayoutLeftPanel
        pageLayoutId="page-layout-id"
        pinnedLeftTabId="pinned-tab-id"
      />,
    );

    expect(scrollWrapper.scrollTop).toBe(0);
  });

  it('resets the pinned scroll wrapper owned by the current rendering context', () => {
    render(
      <PageLayoutLeftPanel
        pageLayoutId="page-layout-id"
        pinnedLeftTabId="pinned-tab-id"
      />,
    );

    const mainViewScrollWrapper = screen.getByTestId('pinned-scroll-wrapper');
    mainViewScrollWrapper.scrollTop = 200;

    mockTargetRecordIdentifier = {
      ...mockTargetRecordIdentifier,
      id: 'side-panel-record-id',
    };
    mockIsInSidePanel = true;

    const { rerender } = render(
      <PageLayoutLeftPanel
        pageLayoutId="page-layout-id"
        pinnedLeftTabId="pinned-tab-id"
      />,
    );
    const sidePanelScrollWrapper = screen.getAllByTestId(
      'pinned-scroll-wrapper',
    )[1];

    expect(sidePanelScrollWrapper.id).not.toBe(mainViewScrollWrapper.id);

    sidePanelScrollWrapper.scrollTop = 200;
    mockTargetRecordIdentifier = {
      ...mockTargetRecordIdentifier,
      id: 'another-side-panel-record-id',
    };

    rerender(
      <PageLayoutLeftPanel
        pageLayoutId="page-layout-id"
        pinnedLeftTabId="pinned-tab-id"
      />,
    );

    expect(mainViewScrollWrapper.scrollTop).toBe(200);
    expect(sidePanelScrollWrapper.scrollTop).toBe(0);
  });
});
