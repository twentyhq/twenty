import { PageLayoutGridLayoutDragSelector } from '@/page-layout/components/PageLayoutGridLayoutDragSelector';
import { PageLayoutGridOverlay } from '@/page-layout/components/PageLayoutGridOverlay';
import { PageLayoutGridResizeHandle } from '@/page-layout/components/PageLayoutGridResizeHandle';
import { ReactGridLayoutCardWrapper } from '@/page-layout/components/ReactGridLayoutCardWrapper';
import { EMPTY_LAYOUT } from '@/page-layout/constants/EmptyLayout';
import {
  PAGE_LAYOUT_CONFIG,
  type PageLayoutBreakpoint,
} from '@/page-layout/constants/PageLayoutBreakpoints';
import { PAGE_LAYOUT_GRID_ITEM_Z_INDEX } from '@/page-layout/constants/PageLayoutGridItemZIndex';
import { PAGE_LAYOUT_GRID_MARGIN } from '@/page-layout/constants/PageLayoutGridMargin';
import { PAGE_LAYOUT_GRID_ROW_HEIGHT } from '@/page-layout/constants/PageLayoutGridRowHeight';
import { usePageLayoutHandleLayoutChange } from '@/page-layout/hooks/usePageLayoutHandleLayoutChange';
import { usePageLayoutTabWithVisibleWidgetsOrThrow } from '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutCurrentBreakpointComponentState } from '@/page-layout/states/pageLayoutCurrentBreakpointComponentState';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { pageLayoutResizingWidgetIdComponentState } from '@/page-layout/states/pageLayoutResizingWidgetIdComponentState';
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

  .react-grid-item {
    z-index: ${PAGE_LAYOUT_GRID_ITEM_Z_INDEX};
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

  const setResizingWidgetId = useSetRecoilComponentState(
    pageLayoutResizingWidgetIdComponentState,
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

  const activeTab = usePageLayoutTabWithVisibleWidgetsOrThrow(tabId);

  const activeTabWidgets = activeTab.widgets;

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

  return (
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
        rowHeight={PAGE_LAYOUT_GRID_ROW_HEIGHT}
        maxCols={12}
        containerPadding={[0, 0]}
        margin={[PAGE_LAYOUT_GRID_MARGIN, PAGE_LAYOUT_GRID_MARGIN]}
        isDraggable={isPageLayoutInEditMode}
        isResizable={isPageLayoutInEditMode}
        draggableHandle=".drag-handle"
        compactType="vertical"
        preventCollision={false}
        resizeHandle={
          isPageLayoutInEditMode ? <PageLayoutGridResizeHandle /> : undefined
        }
        resizeHandles={['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']}
        onDragStart={(_layout, _oldItem, newItem) => {
          setDraggingWidgetId(newItem.i);
        }}
        onDragStop={() => {
          setDraggingWidgetId(null);
        }}
        onResizeStart={(_layout, _oldItem, newItem) => {
          setResizingWidgetId(newItem.i);
        }}
        onResizeStop={() => {
          setResizingWidgetId(null);
        }}
        onLayoutChange={handleLayoutChangeWithoutPendingPlaceholder}
        onBreakpointChange={(newBreakpoint) =>
          setPageLayoutCurrentBreakpoint(newBreakpoint as PageLayoutBreakpoint)
        }
      >
        {gridLayoutItems.map((item) => (
          <ReactGridLayoutCardWrapper key={item.id}>
            {item.type === 'placeholder' ? (
              <WidgetPlaceholder />
            ) : (
              <WidgetRenderer widget={item.widget} />
            )}
          </ReactGridLayoutCardWrapper>
        ))}
      </ResponsiveGridLayout>
    </StyledGridContainer>
  );
};
