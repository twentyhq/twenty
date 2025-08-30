import { GraphWidgetBarChart } from '@/dashboards/graphs/components/GraphWidgetBarChart';
import { GraphWidgetGaugeChart } from '@/dashboards/graphs/components/GraphWidgetGaugeChart';
import { GraphWidgetNumberChart } from '@/dashboards/graphs/components/GraphWidgetNumberChart';
import { GraphWidgetPieChart } from '@/dashboards/graphs/components/GraphWidgetPieChart';
import { SettingsPageFullWidthContainer } from '@/settings/components/SettingsPageFullWidthContainer';
import { SettingsPath } from '@/types/SettingsPath';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
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

  .react-grid-placeholder {
    background: ${({ theme }) => theme.adaptiveColors.blue3} !important;

    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

const StyledGridOverlay = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing(2)};
  left: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
  bottom: ${({ theme }) => theme.spacing(2)};
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 50px;
  gap: ${({ theme }) => theme.spacing(2)};
  pointer-events: none;
  z-index: 0;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StyledGridCell = styled.div`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
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

  const handleLayoutChange = (_: Layout[], allLayouts: Layouts) => {
    setPageLayoutLayouts(allLayouts);
  };

  const handleOpenSidePanel = () => {
    setIsSidePanelOpen(true);
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
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

    const size = getWidgetSize(graphType);

    const newLayout = {
      i: newWidget.id,
      x: 0,
      y: 0,
      ...size,
    };

    setPageLayoutLayouts((prev) => ({
      lg: [...(prev.lg || []), newLayout],
      md: [...(prev.md || []), newLayout],
      sm: [...(prev.sm || []), { ...newLayout, w: 1 }],
    }));
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
      <StyledGridContainer>
        <StyledGridOverlay>
          {Array.from({ length: 12 * gridRows }).map((_, i) => (
            <StyledGridCell key={i} />
          ))}
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
              <div key={widget.id}>
                <PageLayoutWidgetPlaceholder title={widget.title}>
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
      </StyledGridContainer>
      <PageLayoutSidePanel
        isOpen={isSidePanelOpen}
        onClose={handleCloseSidePanel}
        onCreateWidget={handleCreateWidget}
      />
    </SettingsPageFullWidthContainer>
  );
};
