import { GraphWidgetLineChart } from '@/page-layout/widgets/graph/graph-widget-line-chart/components/GraphWidgetLineChart';
import { type LineChartSeriesWithColor } from '@/page-layout/widgets/graph/graph-widget-line-chart/types/LineChartSeriesWithColor';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';
import { UsageSectionSkeleton } from '@/settings/usage/components/UsageSectionSkeleton';
import { useUsageAnalyticsData } from '@/settings/usage/hooks/useUsageAnalyticsData';
import { useUsageValueFormatter } from '@/settings/usage/hooks/useUsageValueFormatter';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { type UsageOperationType } from '~/generated-metadata/graphql';
import { formatDate } from '~/utils/date-utils';

const StyledLineChartContainer = styled.div`
  height: 200px;
  width: 100%;
`;

type UsageDailyChartSectionProps = {
  title: string;
  description: string;
  chartId: string;
  chartLabel: string;
  operationTypes?: UsageOperationType[];
  userWorkspaceId?: string;
  skip?: boolean;
};

export const UsageDailyChartSection = ({
  title,
  description,
  chartId,
  chartLabel,
  operationTypes,
  userWorkspaceId,
  skip,
}: UsageDailyChartSectionProps) => {
  const { analytics, isInitialLoading, period, setPeriod, periodOptions } =
    useUsageAnalyticsData({
      operationTypes,
      userWorkspaceId,
      skip,
    });

  const { formatUsageValue } = useUsageValueFormatter();

  if (isInitialLoading) {
    return <UsageSectionSkeleton />;
  }

  if (!analytics) {
    return null;
  }

  const timeSeries = userWorkspaceId
    ? (analytics.userDailyUsage?.dailyUsage ?? [])
    : analytics.timeSeries;

  if (timeSeries.length === 0) {
    return null;
  }

  const lineData: LineChartSeriesWithColor[] = [
    {
      id: chartId,
      label: chartLabel,
      data: timeSeries.map((point) => ({
        x: formatDate(point.date, 'MMM d'),
        y: point.creditsUsed,
      })),
    },
  ];

  return (
    <Section>
      <H2Title
        title={title}
        description={description}
        adornment={
          <Select
            dropdownId={`${chartId}-period`}
            value={period}
            options={periodOptions}
            onChange={setPeriod}
            needIconCheck
            selectSizeVariant="small"
          />
        }
      />
      <SubscriptionInfoContainer>
        <StyledLineChartContainer>
          <WidgetComponentInstanceContext.Provider
            value={{ instanceId: `${chartId}-line-chart` }}
          >
            <GraphWidgetLineChart
              id={`${chartId}-line-chart`}
              data={lineData}
              colorMode="automaticPalette"
              showLegend={false}
              enableArea
              displayType="custom"
              customFormatter={formatUsageValue}
            />
          </WidgetComponentInstanceContext.Provider>
        </StyledLineChartContainer>
      </SubscriptionInfoContainer>
    </Section>
  );
};
