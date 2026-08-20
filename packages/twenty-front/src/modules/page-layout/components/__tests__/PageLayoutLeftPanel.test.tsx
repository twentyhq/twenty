import { PageLayoutLeftPanel } from '@/page-layout/components/PageLayoutLeftPanel';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { PageLayoutType } from '~/generated-metadata/graphql';

let mockTargetRecordIdentifier = {
  id: 'record-id',
  targetObjectNameSingular: 'company',
};

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
  useLayoutRenderingContext: () => ({ isInSidePanel: false }),
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
  });

  it('resets the pinned scroll position when the target record changes', () => {
    const { rerender } = render(
      <PageLayoutLeftPanel pinnedLeftTabId="pinned-tab-id" />,
    );

    const scrollWrapper = screen.getByTestId('pinned-scroll-wrapper');
    scrollWrapper.scrollTop = 200;

    mockTargetRecordIdentifier = {
      ...mockTargetRecordIdentifier,
      id: 'another-record-id',
    };

    rerender(<PageLayoutLeftPanel pinnedLeftTabId="pinned-tab-id" />);

    expect(scrollWrapper.scrollTop).toBe(0);
  });
});
