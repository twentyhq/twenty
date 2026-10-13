import { styled } from '@linaria/react';
import { Section } from 'twenty-ui/components/layout';

import { PageLayoutEditModeProviderContext } from '@/page-layout/contexts/PageLayoutEditModeContext';
import { GraphWidgetLineChart } from '@/page-layout/widgets/graph/graph-widget-line-chart/components/GraphWidgetLineChart';
import { type LineChartSeriesWithColor } from '@/page-layout/widgets/graph/graph-widget-line-chart/types/LineChartSeriesWithColor';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';

const StyledLineChartContainer = styled.div`
  height: 200px;
  width: 100%;
`;

type LogConsoleAppAnalyticsLineChartSectionProps = {
  title: string;
  description: string;
  chartId: string;
  series: LineChartSeriesWithColor[];
  formatValue: (value: number) => string;
};

export const LogConsoleAppAnalyticsLineChartSection = ({
  title,
  description,
  chartId,
  series,
  formatValue,
}: LogConsoleAppAnalyticsLineChartSectionProps) => {
  if (series.every((singleSeries) => singleSeries.data.length === 0)) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Header title={title} description={description} />
      <SubscriptionInfoContainer>
        <StyledLineChartContainer>
          <WidgetComponentInstanceContext.Provider
            value={{ instanceId: `${chartId}-line-chart` }}
          >
            {/* The legend reads the page layout edit mode, and a console chart is never on an editable page layout */}
            <PageLayoutEditModeProviderContext value={{ isInEditMode: false }}>
              <GraphWidgetLineChart
                id={`${chartId}-line-chart`}
                data={series}
                colorMode="automaticPalette"
                showLegend={series.length > 1}
                enableArea
                displayType="custom"
                customFormatter={formatValue}
              />
            </PageLayoutEditModeProviderContext>
          </WidgetComponentInstanceContext.Provider>
        </StyledLineChartContainer>
      </SubscriptionInfoContainer>
    </Section.Root>
  );
};
