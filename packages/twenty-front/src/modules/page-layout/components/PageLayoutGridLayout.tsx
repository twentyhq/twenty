import { PageLayoutGridLayoutDragSelector } from '@/page-layout/components/PageLayoutGridLayoutDragSelector';
import { PageLayoutGridOverlay } from '@/page-layout/components/PageLayoutGridOverlay';
import { PageLayoutGridResizeHandle } from '@/page-layout/components/PageLayoutGridResizeHandle';
import { EMPTY_LAYOUT } from '@/page-layout/constants/EmptyLayout';
import {
  PAGE_LAYOUT_CONFIG,
  type PageLayoutBreakpoint,
} from '@/page-layout/constants/PageLayoutBreakpoints';
import { PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY } from '@/page-layout/constants/PendingWidgetPlaceholderLayoutKey';
import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';
import { usePageLayoutHandleLayoutChange } from '@/page-layout/hooks/usePageLayoutHandleLayoutChange';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutCurrentBreakpointComponentState } from '@/page-layout/states/pageLayoutCurrentBreakpointComponentState';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { addPendingPlaceholderToLayouts } from '@/page-layout/utils/addPendingPlaceholderToLayouts';
import { filterPendingPlaceholderFromLayouts } from '@/page-layout/utils/filterPendingPlaceholderFromLayouts';
import { WidgetPlaceholder } from '@/page-layout/widgets/components/WidgetPlaceholder';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { useCallback, useRef } from 'react';
import {
  Responsive,
  WidthProvider,
  type Layout,
  type Layouts,
  type ResponsiveProps,
} from 'react-grid-layout';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated/graphql';

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

const StyledVerticalListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type PageLayoutGridLayoutProps = {
  tabId: string;
};

export const PageLayoutGridLayout = ({ tabId }: PageLayoutGridLayoutProps) => {
  const isRecordPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_ENABLED,
  );

  const setPageLayoutCurrentBreakpoint = useSetRecoilComponentState(
    pageLayoutCurrentBreakpointComponentState,
  );

  const setDraggingWidgetId = useSetRecoilComponentState(
    pageLayoutDraggingWidgetIdComponentState,
  );

  const { handleLayoutChange } = usePageLayoutHandleLayoutChange();

  const handleLayoutChangeWithoutPendingPlaceholder = useCallback(
    (currentLayout: Layout[], allLayouts: Layouts) => {
      handleLayoutChange(
        currentLayout,
        filterPendingPlaceholderFromLayouts(allLayouts),
      );
    },
    [handleLayoutChange],
  );

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

  if (!isDefined(currentPageLayout) || !isDefined(activeTab)) {
    return null;
  }

  const activeTabWidgets = activeTab.widgets;

  const isLayoutEmpty =
    !isDefined(activeTabWidgets) || activeTabWidgets.length === 0;

  const hasPendingPlaceholder =
    isDefined(pageLayoutDraggedArea) && !isLayoutEmpty;

  const baseLayouts = isLayoutEmpty
    ? EMPTY_LAYOUT
    : (pageLayoutCurrentLayouts[tabId] ?? EMPTY_LAYOUT);

  const layouts = hasPendingPlaceholder
    ? addPendingPlaceholderToLayouts(baseLayouts, pageLayoutDraggedArea)
    : baseLayouts;

  const widgetsArray = isLayoutEmpty
    ? [
        <div key="empty-placeholder" data-select-disable="true">
          <WidgetPlaceholder />
        </div>,
      ]
    : [
        ...(activeTabWidgets?.map((widget) => (
          <div key={widget.id} data-select-disable="true">
            <WidgetRenderer widget={widget} />
          </div>
        )) || []),
        ...(hasPendingPlaceholder
          ? [
              <div
                key={PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY}
                data-select-disable="true"
              >
                <WidgetPlaceholder />
              </div>,
            ]
          : []),
      ];

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

        {isRecordPageEnabled &&
        !isPageLayoutInEditMode &&
        activeTab.layoutMode === 'vertical-list' ? (
          <StyledVerticalListContainer>
            {widgetsArray}
          </StyledVerticalListContainer>
        ) : (
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
              isPageLayoutInEditMode ? (
                <PageLayoutGridResizeHandle />
              ) : undefined
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
            {widgetsArray}
          </ResponsiveGridLayout>
        )}
      </StyledGridContainer>
    </>
  );
};
