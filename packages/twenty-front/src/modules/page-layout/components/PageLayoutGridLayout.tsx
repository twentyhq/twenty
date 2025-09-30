import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { PageLayoutGridLayoutDragSelector } from '@/page-layout/components/PageLayoutGridLayoutDragSelector';
import { PageLayoutGridOverlay } from '@/page-layout/components/PageLayoutGridOverlay';
import { EMPTY_LAYOUT } from '@/page-layout/constants/EmptyLayout';
import {
  PAGE_LAYOUT_CONFIG,
  type PageLayoutBreakpoint,
} from '@/page-layout/constants/PageLayoutBreakpoints';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { usePageLayoutHandleLayoutChange } from '@/page-layout/hooks/usePageLayoutHandleLayoutChange';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutCurrentBreakpointComponentState } from '@/page-layout/states/pageLayoutCurrentBreakpointComponentState';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { WidgetPlaceholder } from '@/page-layout/widgets/components/WidgetPlaceholder';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
import { useRef } from 'react';
import {
  Responsive,
  WidthProvider,
  type ResponsiveProps,
} from 'react-grid-layout';
import { isDefined } from 'twenty-shared/utils';

const StyledGridContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
  box-sizing: border-box;
  flex: 1;
  min-height: 100%;
  position: relative;
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  user-select: none;

  .react-grid-placeholder {
    background: ${({ theme }) => theme.adaptiveColors.blue3} !important;

    border-radius: ${({ theme }) => theme.border.radius.sm};
  }

  .react-grid-item:not(.react-draggable-dragging) {
    user-select: auto;
  }
`;

type ExtendedResponsiveProps = ResponsiveProps & {
  maxCols?: number;
  preventCollision?: boolean;
};

const ResponsiveGridLayout = WidthProvider(
  Responsive,
) as React.ComponentType<ExtendedResponsiveProps>;

export const PageLayoutGridLayout = () => {
  const setPageLayoutCurrentBreakpoint = useSetRecoilComponentState(
    pageLayoutCurrentBreakpointComponentState,
  );

  const { handleLayoutChange } = usePageLayoutHandleLayoutChange();

  const gridContainerRef = useRef<HTMLDivElement>(null);

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const pageLayoutCurrentLayouts = useRecoilComponentValue(
    pageLayoutCurrentLayoutsComponentState,
  );

  const activeTabId = useRecoilComponentValue(activeTabIdComponentState);

  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

  const { currentPageLayout } = useCurrentPageLayout();

  if (!isDefined(activeTabId) || !isDefined(currentPageLayout)) {
    return null;
  }

  const activeTabWidgets = currentPageLayout.tabs.find(
    (tab) => tab.id === activeTabId,
  )?.widgets;

  const isLayoutEmpty =
    !isDefined(activeTabWidgets) || activeTabWidgets.length === 0;

  const layouts = isLayoutEmpty
    ? EMPTY_LAYOUT
    : pageLayoutCurrentLayouts[activeTabId] || EMPTY_LAYOUT;

  return (
    <>
      <StyledGridContainer ref={gridContainerRef}>
        {isPageLayoutInEditMode && (
          <>
            <PageLayoutGridOverlay />
            <PageLayoutGridLayoutDragSelector
              gridContainerRef={gridContainerRef}
            />
          </>
        )}
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={PAGE_LAYOUT_CONFIG.breakpoints}
          cols={PAGE_LAYOUT_CONFIG.columns}
          rowHeight={55}
          maxCols={12}
          containerPadding={[0, 0]}
          margin={[8, 8]}
          isDraggable={isPageLayoutInEditMode}
          isResizable={isPageLayoutInEditMode}
          draggableHandle=".drag-handle"
          compactType="vertical"
          preventCollision={false}
          onLayoutChange={handleLayoutChange}
          onBreakpointChange={(newBreakpoint) =>
            setPageLayoutCurrentBreakpoint(
              newBreakpoint as PageLayoutBreakpoint,
            )
          }
        >
          {isLayoutEmpty ? (
            <div key="empty-placeholder" data-select-disable="true">
              <WidgetPlaceholder
                onClick={() => {
                  navigatePageLayoutCommandMenu({
                    commandMenuPage:
                      CommandMenuPages.PageLayoutWidgetTypeSelect,
                  });
                }}
              />
            </div>
          ) : (
            activeTabWidgets?.map((widget) => (
              <div key={widget.id} data-select-disable="true">
                <WidgetRenderer widget={widget} />
              </div>
            ))
          )}
        </ResponsiveGridLayout>
      </StyledGridContainer>
    </>
  );
};
