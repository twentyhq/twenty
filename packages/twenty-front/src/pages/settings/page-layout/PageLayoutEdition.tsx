import { GraphWidgetGaugeChart } from '@/dashboards/graphs/components/GraphWidgetGaugeChart';
import { GraphWidgetNumberChart } from '@/dashboards/graphs/components/GraphWidgetNumberChart';
import { GraphWidgetPieChart } from '@/dashboards/graphs/components/GraphWidgetPieChart';
import { SettingsPageFullWidthContainer } from '@/settings/components/SettingsPageFullWidthContainer';
import { SettingsPath } from '@/types/SettingsPath';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
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
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { PageLayoutWidgetPlaceholder } from './components/PageLayoutWidgetPlaceholder';
import { mockLayouts, mockWidgets } from './mocks/mockWidgets';
import {
  pageLayoutLayoutsState,
  pageLayoutWidgetsState,
} from './states/pageLayoutState';

const StyledGridContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
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

  @media (max-width: 768px) and (min-width: 481px) {
    grid-template-columns: repeat(12, 1fr);
  }
`;

const StyledGridCell = styled.div`
  background: 'transparent';
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

  const handleLayoutChange = (_: Layout[], allLayouts: Layouts) => {
    setPageLayoutLayouts(allLayouts);
  };

  const handleAddWidget = () => {
    // temp: Populate with mock data when empty placeholder is clicked
    setPageLayoutWidgets(mockWidgets);
    setPageLayoutLayouts(mockLayouts);
  };

  const isEmptyState = pageLayoutWidgets.length === 0;

  const emptyLayout: Layouts = {
    lg: [{ i: 'empty-placeholder', x: 0, y: 0, w: 4, h: 4, static: true }],
    md: [{ i: 'empty-placeholder', x: 0, y: 0, w: 4, h: 4, static: true }],
    sm: [{ i: 'empty-placeholder', x: 0, y: 0, w: 1, h: 4, static: true }],
  };

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
    >
      <StyledGridContainer>
        <StyledGridOverlay>
          {Array.from({ length: 12 * 20 }).map((_, i) => (
            <StyledGridCell key={i} />
          ))}
        </StyledGridOverlay>
        <ResponsiveGridLayout
          className="layout"
          layouts={isEmptyState ? emptyLayout : pageLayoutLayouts}
          breakpoints={{ lg: 1024, md: 768, sm: 480 }}
          cols={{ lg: 12, md: 12, sm: 1 }}
          rowHeight={50}
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
            <div key="empty-placeholder" onClick={handleAddWidget}>
              <PageLayoutWidgetPlaceholder title="" isEmpty={true} />
            </div>
          ) : (
            pageLayoutWidgets.map((widget) => (
              <div key={widget.id}>
                <PageLayoutWidgetPlaceholder title={widget.title}>
                  {widget.type === 'number' && (
                    <GraphWidgetNumberChart
                      value={widget.data.value}
                      trendPercentage={widget.data.trendPercentage}
                    />
                  )}
                  {widget.type === 'gauge' && (
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
                  {widget.type === 'pie' && (
                    <GraphWidgetPieChart
                      data={widget.data.items}
                      showLegend={true}
                      displayType="percentage"
                      id={`pie-chart-${widget.id}`}
                    />
                  )}
                </PageLayoutWidgetPlaceholder>
              </div>
            ))
          )}
        </ResponsiveGridLayout>
      </StyledGridContainer>
    </SettingsPageFullWidthContainer>
  );
};
