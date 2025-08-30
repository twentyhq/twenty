import { GraphWidgetBarChart } from '@/dashboards/graphs/components/GraphWidgetBarChart';
import { GraphWidgetGaugeChart } from '@/dashboards/graphs/components/GraphWidgetGaugeChart';
import { GraphWidgetNumberChart } from '@/dashboards/graphs/components/GraphWidgetNumberChart';
import { GraphWidgetPieChart } from '@/dashboards/graphs/components/GraphWidgetPieChart';
import { SettingsPageFullWidthContainer } from '@/settings/components/SettingsPageFullWidthContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useRef, useState } from 'react';
import {
  Responsive,
  WidthProvider,
  type Layout,
  type Layouts,
  type ResponsiveProps,
} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { v4 as uuidv4 } from 'uuid';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { PageLayoutSidePanel } from './components/PageLayoutSidePanel';
import { PageLayoutWidgetPlaceholder } from './components/PageLayoutWidgetPlaceholder';
import { type GraphSubType, type Widget } from './mocks/mockWidgets';
import {
  pageLayoutLayoutsState,
  pageLayoutWidgetsState,
} from './states/pageLayoutState';
import {
  getDefaultWidgetData,
  getWidgetSize,
  getWidgetTitle,
} from './utils/getDefaultWidgetData';

const StyledGridContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  box-sizing: border-box;
  flex: 1;
  min-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  user-select: none; /* Prevent text selection during drag operations */

  .react-grid-placeholder {
    background: ${({ theme }) => theme.adaptiveColors.blue3} !important;

    border-radius: ${({ theme }) => theme.border.radius.sm};
  }

  /* Re-enable text selection for widget content when not dragging */
  .react-grid-item:not(.react-draggable-dragging) {
    user-select: auto;
  }
`;

const StyledGridOverlay = styled.div<{ isDragSelecting?: boolean }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing(2)};
  left: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
  bottom: ${({ theme }) => theme.spacing(2)};
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 50px;
  gap: ${({ theme }) => theme.spacing(2)};
  pointer-events: ${({ isDragSelecting }) =>
    isDragSelecting ? 'auto' : 'none'};
  z-index: 0;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StyledGridCell = styled.div<{ isSelected?: boolean }>`
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.adaptiveColors.blue3 : 'transparent'};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  transition: background-color 0.1s ease;
`;

type ExtendedResponsiveProps = ResponsiveProps & {
  maxCols?: number;
  preventCollision?: boolean;
};

const ResponsiveGridLayout = WidthProvider(
  Responsive,
) as React.ComponentType<ExtendedResponsiveProps>;

export const PageLayoutEdition = () => {
  const { t } = useLingui();
  const [pageLayoutWidgets, setPageLayoutWidgets] = useRecoilState(
    pageLayoutWidgetsState,
  );
  const [pageLayoutLayouts, setPageLayoutLayouts] = useRecoilState(
    pageLayoutLayoutsState,
  );
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [draggedArea, setDraggedArea] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const handleLayoutChange = (_: Layout[], allLayouts: Layouts) => {
    setPageLayoutLayouts(allLayouts);
  };

  const handleOpenSidePanel = () => {
    setIsSidePanelOpen(true);
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setDraggedArea(null);
  };

  const handleCreateWidget = (widgetType: 'GRAPH', graphType: GraphSubType) => {
    const widgetData = getDefaultWidgetData(graphType);

    const existingWidgetCount = pageLayoutWidgets.filter(
      (w) => w.type === widgetType && w.graphType === graphType,
    ).length;
    const title = getWidgetTitle(graphType, existingWidgetCount);

    const newWidget: Widget = {
      id: `widget-${uuidv4()}`,
      type: widgetType,
      graphType,
      title,
      data: widgetData,
    };

    setPageLayoutWidgets((prev) => [...prev, newWidget]);

    const defaultSize = getWidgetSize(graphType);
    const position = draggedArea || {
      x: 0,
      y: 0,
      w: defaultSize.w,
      h: defaultSize.h,
    };

    const newLayout = {
      i: newWidget.id,
      x: position.x,
      y: position.y,
      w: position.w,
      h: position.h,
    };

    setPageLayoutLayouts((prev) => ({
      lg: [...(prev.lg || []), newLayout],
      md: [...(prev.md || []), newLayout],
      sm: [...(prev.sm || []), { ...newLayout, w: 1, x: 0 }],
    }));

    setDraggedArea(null);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setPageLayoutWidgets((prev) => prev.filter((w) => w.id !== widgetId));

    setPageLayoutLayouts((prev) => ({
      lg: (prev.lg || []).filter((layout) => layout.i !== widgetId),
      md: (prev.md || []).filter((layout) => layout.i !== widgetId),
      sm: (prev.sm || []).filter((layout) => layout.i !== widgetId),
    }));
  };

  const handleDragSelectionStart = () => {
    setSelectedCells(new Set());
  };

  const handleDragSelectionChange = (cellId: string, selected: boolean) => {
    setSelectedCells((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(cellId);
      } else {
        newSet.delete(cellId);
      }
      return newSet;
    });
  };

  const handleDragSelectionEnd = () => {
    if (selectedCells.size > 0) {
      const cellCoords = Array.from(selectedCells).map((cellId) => {
        const [col, row] = cellId.split('-').slice(1).map(Number);
        return { col, row };
      });

      const minCol = Math.min(...cellCoords.map((c) => c.col));
      const maxCol = Math.max(...cellCoords.map((c) => c.col));
      const minRow = Math.min(...cellCoords.map((c) => c.row));
      const maxRow = Math.max(...cellCoords.map((c) => c.row));

      const draggedBounds = {
        x: minCol,
        y: minRow,
        w: maxCol - minCol + 1,
        h: maxRow - minRow + 1,
      };

      setDraggedArea(draggedBounds);
      setIsSidePanelOpen(true);
      setSelectedCells(new Set());
    }
  };

  const isEmptyState = pageLayoutWidgets.length === 0;

  const emptyLayout: Layouts = {
    lg: [{ i: 'empty-placeholder', x: 0, y: 0, w: 4, h: 4, static: true }],
    md: [{ i: 'empty-placeholder', x: 0, y: 0, w: 4, h: 4, static: true }],
    sm: [{ i: 'empty-placeholder', x: 0, y: 0, w: 1, h: 4, static: true }],
  };

  // TODO: I dont like this lets back to this after -- need help!
  // the plan is to fill the height on default, also fill up the virtual cells when the grid container height elongates
  const gridRows = useMemo(() => {
    const allLayouts = [
      ...(pageLayoutLayouts.lg || []),
      ...(pageLayoutLayouts.md || []),
      ...(pageLayoutLayouts.sm || []),
    ];

    const contentRows =
      allLayouts.length === 0
        ? 0
        : Math.max(...allLayouts.map((item) => item.y + item.h));

    if (isDefined(typeof window)) return contentRows + 25;

    const viewportHeight = window.innerHeight;
    const containerHeight = viewportHeight * 0.8;
    const rowTotalHeight = 50 + 8;
    const viewportRows = Math.ceil(containerHeight / rowTotalHeight);

    return Math.max(viewportRows, contentRows + 10);
  }, [pageLayoutLayouts]);

  return (
    <SettingsPageFullWidthContainer
      links={[
        {
          children: t`Settings`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`Page Layout`,
        },
      ]}
      actionButton={
        !isEmptyState && (
          <Button
            Icon={IconPlus}
            title={t`Add Widget`}
            size="small"
            variant="secondary"
            onClick={handleOpenSidePanel}
          />
        )
      }
    >
      <StyledGridContainer ref={gridContainerRef}>
        <StyledGridOverlay isDragSelecting={true}>
          {Array.from({ length: 12 * gridRows }).map((_, i) => {
            const col = i % 12;
            const row = Math.floor(i / 12);
            const cellId = `cell-${col}-${row}`;
            return (
              <StyledGridCell
                key={i}
                data-selectable-id={cellId}
                isSelected={selectedCells.has(cellId)}
              />
            );
          })}
        </StyledGridOverlay>
        <ResponsiveGridLayout
          className="layout"
          layouts={isEmptyState ? emptyLayout : pageLayoutLayouts}
          breakpoints={{ lg: 1024, md: 768, sm: 480 }}
          cols={{ lg: 12, md: 12, sm: 1 }}
          rowHeight={50}
          maxCols={12}
          containerPadding={[0, 0]}
          margin={[8, 8]}
          isDraggable={true}
          isResizable={true}
          draggableHandle=".drag-handle"
          compactType="vertical"
          preventCollision={false}
          onLayoutChange={handleLayoutChange}
        >
          {isEmptyState ? (
            <div key="empty-placeholder" onClick={handleOpenSidePanel}>
              <PageLayoutWidgetPlaceholder title="" isEmpty={true} />
            </div>
          ) : (
            pageLayoutWidgets.map((widget) => (
              <div key={widget.id} data-select-disable="true">
                <PageLayoutWidgetPlaceholder
                  title={widget.title}
                  onRemove={() => handleRemoveWidget(widget.id)}
                >
                  {widget.type === 'GRAPH' && widget.graphType === 'number' && (
                    <GraphWidgetNumberChart
                      value={widget.data.value}
                      trendPercentage={widget.data.trendPercentage}
                    />
                  )}
                  {widget.type === 'GRAPH' && widget.graphType === 'gauge' && (
                    <GraphWidgetGaugeChart
                      data={{
                        value: widget.data.value,
                        min: widget.data.min,
                        max: widget.data.max,
                        label: widget.data.label,
                      }}
                      displayType="percentage"
                      showValue={true}
                      id={`gauge-chart-${widget.id}`}
                    />
                  )}
                  {widget.type === 'GRAPH' && widget.graphType === 'pie' && (
                    <GraphWidgetPieChart
                      data={widget.data.items}
                      showLegend={true}
                      displayType="percentage"
                      id={`pie-chart-${widget.id}`}
                    />
                  )}
                  {widget.type === 'GRAPH' && widget.graphType === 'bar' && (
                    <GraphWidgetBarChart
                      data={widget.data.items}
                      indexBy={widget.data.indexBy}
                      keys={widget.data.keys}
                      seriesLabels={widget.data.seriesLabels}
                      layout={widget.data.layout}
                      showLegend={true}
                      showGrid={true}
                      displayType="number"
                      id={`bar-chart-${widget.id}`}
                    />
                  )}
                </PageLayoutWidgetPlaceholder>
              </div>
            ))
          )}
        </ResponsiveGridLayout>
        <DragSelect
          selectableItemsContainerRef={gridContainerRef}
          onDragSelectionStart={handleDragSelectionStart}
          onDragSelectionChange={handleDragSelectionChange}
          onDragSelectionEnd={handleDragSelectionEnd}
        />
      </StyledGridContainer>
      <PageLayoutSidePanel
        isOpen={isSidePanelOpen}
        onClose={handleCloseSidePanel}
        onCreateWidget={handleCreateWidget}
      />
    </SettingsPageFullWidthContainer>
  );
};
