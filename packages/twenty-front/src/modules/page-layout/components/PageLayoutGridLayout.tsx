import { PageLayoutGridLayoutDragSelector } from '@/page-layout/components/PageLayoutGridLayoutDragSelector';
import { PageLayoutGridOverlay } from '@/page-layout/components/PageLayoutGridOverlay';
import { PageLayoutGridResizeHandle } from '@/page-layout/components/PageLayoutGridResizeHandle';
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
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { addPendingPlaceholderToLayouts } from '@/page-layout/utils/addPendingPlaceholderToLayouts';
import { filterPendingPlaceholderFromLayouts } from '@/page-layout/utils/filterPendingPlaceholderFromLayouts';
import { prepareGridLayoutItemsWithPlaceholders } from '@/page-layout/utils/prepareGridLayoutItemsWithPlaceholders';
import { WidgetPlaceholder } from '@/page-layout/widgets/components/WidgetPlaceholder';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
import { useMemo, useRef } from 'react';
import {
  Responsive,
  WidthProvider,
  type Layout,
  type Layouts,
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
    background: ${({ theme }) => theme.color.blue7} !important;

    border-radius: ${({ theme }) => theme.border.radius.md};
  }

  .react-grid-item:not(.react-draggable-dragging) {
    user-select: auto;
  }

  .react-grid-item:hover .widget-card-resize-handle {
    display: block !important;
  }
`;

type ExtendedResponsiveProps = ResponsiveProps & {
  maxCols?: number;
  preventCollision?: boolean;
};

const ResponsiveGridLayout = WidthProvider(
  Responsive,
) as React.ComponentType<ExtendedResponsiveProps>;

type PageLayoutGridLayoutProps = {
  tabId: string;
};

export const PageLayoutGridLayout = ({ tabId }: PageLayoutGridLayoutProps) => {
  const setPageLayoutCurrentBreakpoint = useSetRecoilComponentState(
    pageLayoutCurrentBreakpointComponentState,
  );

  const setDraggingWidgetId = useSetRecoilComponentState(
    pageLayoutDraggingWidgetIdComponentState,
  );

  const { handleLayoutChange } = usePageLayoutHandleLayoutChange();

  const handleLayoutChangeWithoutPendingPlaceholder = (
    currentLayout: Layout[],
    allLayouts: Layouts,
  ) => {
    handleLayoutChange(
      currentLayout,
      filterPendingPlaceholderFromLayouts(allLayouts),
    );
  };

  const gridContainerRef = useRef<HTMLDivElement>(null);

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  const pageLayoutCurrentLayouts = useRecoilComponentValue(
    pageLayoutCurrentLayoutsComponentState,
  );

  const pageLayoutDraggedArea = useRecoilComponentValue(
    pageLayoutDraggedAreaComponentState,
  );

  const { currentPageLayout } = useCurrentPageLayout();

  const activeTab = currentPageLayout?.tabs.find((tab) => tab.id === tabId);

  const activeTabWidgets = activeTab?.widgets;

  const isLayoutEmpty =
    !isDefined(activeTabWidgets) || activeTabWidgets.length === 0;

  const hasPendingPlaceholder = isDefined(pageLayoutDraggedArea);

  const baseLayouts = isLayoutEmpty
    ? EMPTY_LAYOUT
    : (pageLayoutCurrentLayouts[tabId] ?? EMPTY_LAYOUT);

  const layouts = hasPendingPlaceholder
    ? addPendingPlaceholderToLayouts(baseLayouts, pageLayoutDraggedArea)
    : baseLayouts;

  const gridLayoutItems = useMemo(
    () =>
      prepareGridLayoutItemsWithPlaceholders(
        activeTabWidgets,
        hasPendingPlaceholder,
      ),
    [activeTabWidgets, hasPendingPlaceholder],
  );

  if (!isDefined(currentPageLayout) || !isDefined(activeTab)) {
    return null;
  }

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
          resizeHandle={
            isPageLayoutInEditMode ? <PageLayoutGridResizeHandle /> : undefined
          }
          resizeHandles={['se']}
          onDragStart={(_layout, _oldItem, newItem) => {
            setDraggingWidgetId(newItem.i);
          }}
          onDragStop={() => {
            setDraggingWidgetId(null);
          }}
          onLayoutChange={handleLayoutChangeWithoutPendingPlaceholder}
          onBreakpointChange={(newBreakpoint) =>
            setPageLayoutCurrentBreakpoint(
              newBreakpoint as PageLayoutBreakpoint,
            )
          }
        >
          {gridLayoutItems.map((item) => (
            <div key={item.id} data-select-disable="true">
              {item.type === 'placeholder' ? (
                <WidgetPlaceholder />
              ) : (
                <WidgetRenderer
                  widget={item.widget}
                  pageLayoutType={currentPageLayout.type}
                  layoutMode="grid"
                />
              )}
            </div>
          ))}
        </ResponsiveGridLayout>
      </StyledGridContainer>
    </>
  );
};
