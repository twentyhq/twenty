import { GraphWidgetGaugeChart } from '@/dashboards/graphs/components/GraphWidgetGaugeChart';
import { GraphWidgetNumberChart } from '@/dashboards/graphs/components/GraphWidgetNumberChart';
import { GraphWidgetPieChart } from '@/dashboards/graphs/components/GraphWidgetPieChart';
import { SettingsPageFullWidthContainer } from '@/settings/components/SettingsPageFullWidthContainer';
import { SettingsPath } from '@/types/SettingsPath';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Responsive, WidthProvider, type Layouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { PageLayoutWidgetPlaceholder } from './components/PageLayoutWidgetPlaceholder';

const StyledGridContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  position: relative;
  width: 100%;

  .react-grid-placeholder {
    background: ${({ theme }) => theme.adaptiveColors.blue3} !important;

    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

const StyledGridOverlay = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 50px;
  gap: 8px;
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

const ResponsiveGridLayout = WidthProvider(Responsive) as any;

export const PageLayoutEdition = () => {
  const { t } = useLingui();
  const [layouts] = useState<Layouts>({
    lg: [
      {
        i: 'widget-1',
        x: 0,
        y: 0,
        w: 3,
        h: 2,
      },
      {
        i: 'widget-2',
        x: 3,
        y: 0,
        w: 3,
        h: 5,
      },
      {
        i: 'widget-3',
        x: 6,
        y: 0,
        w: 4,
        h: 5,
      },
      {
        i: 'widget-4',
        x: 0,
        y: 5,
        w: 3,
        h: 3,
      },
    ],
    md: [
      {
        i: 'widget-1',
        x: 0,
        y: 0,
        w: 3,
        h: 2,
      },
      {
        i: 'widget-2',
        x: 3,
        y: 0,
        w: 3,
        h: 5,
      },
      {
        i: 'widget-3',
        x: 6,
        y: 0,
        w: 4,
        h: 5,
      },
    ],
    sm: [
      {
        i: 'widget-1',
        x: 0,
        y: 0,
        w: 1,
        h: 2,
      },
      {
        i: 'widget-2',
        x: 0,
        y: 2,
        w: 1,
        h: 5,
      },
      {
        i: 'widget-3',
        x: 0,
        y: 7,
        w: 1,
        h: 5,
      },
    ],
  });

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
          {/* Generate enough cells to fill viewport - CSS Grid will handle layout */}
          {Array.from({ length: 12 * 20 }).map((_, i) => (
            <StyledGridCell key={i} />
          ))}
        </StyledGridOverlay>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1024, md: 768, sm: 480 }}
          cols={{ lg: 12, md: 12, sm: 1 }}
          rowHeight={50}
          maxCols={12}
          containerPadding={[0, 0]}
          margin={[8, 8]}
          isDraggable={true}
          isResizable={true}
          draggableHandle=".drag-handle"
          compactType="vertical" // to be discussed -- I am not sure
          preventCollision={false}
        >
          <div key="widget-1">
            <PageLayoutWidgetPlaceholder title="Sales Pipeline">
              <GraphWidgetNumberChart value="1,234" trendPercentage={12.5} />
            </PageLayoutWidgetPlaceholder>
          </div>
          <div key="widget-2">
            <PageLayoutWidgetPlaceholder title="Conversion Rate">
              <GraphWidgetGaugeChart
                data={{
                  value: 0.5,
                  min: 0,
                  max: 1,
                  label: 'Conversion rate',
                  to: '/metrics/conversion',
                }}
                displayType="percentage"
                showValue={true}
                id="gauge-chart-widget-2"
              />
            </PageLayoutWidgetPlaceholder>
          </div>
          <div key="widget-3">
            <PageLayoutWidgetPlaceholder title="Lead Distribution">
              <GraphWidgetPieChart
                data={[
                  {
                    id: 'qualified',
                    value: 35,
                    label: 'Qualified',
                    to: '/leads/qualified',
                  },
                  {
                    id: 'contacted',
                    value: 25,
                    label: 'Contacted',
                    to: '/leads/contacted',
                  },
                  {
                    id: 'unqualified',
                    value: 20,
                    label: 'Unqualified',
                    to: '/leads/unqualified',
                  },
                  {
                    id: 'proposal',
                    value: 15,
                    label: 'Proposal',
                    to: '/leads/proposal',
                  },
                  {
                    id: 'negotiation',
                    value: 5,
                    label: 'Negotiation',
                    to: '/leads/negotiation',
                  },
                ]}
                showLegend={true}
                displayType="percentage"
                id="pie-chart-widget-3"
              />
            </PageLayoutWidgetPlaceholder>
          </div>
        </ResponsiveGridLayout>
      </StyledGridContainer>
    </SettingsPageFullWidthContainer>
  );
};
