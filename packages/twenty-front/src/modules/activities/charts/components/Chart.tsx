import styled from '@emotion/styled';
import { ResponsiveBar } from '@nivo/bar';

import { Chart as ChartType } from '@/activities/charts/types/Chart';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useChartDataQuery } from '~/generated/graphql';

const StyledChartContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

interface ChartProps {
  targetableObject: ActivityTargetableObject;
}

export const Chart = (props: ChartProps) => {
  const { record: chart, loading: chartLoading } = useFindOneRecord<ChartType>({
    objectRecordId: props.targetableObject.id,
    objectNameSingular: props.targetableObject.targetObjectNameSingular,
  });

  const { data: chartDataResponse, loading: chartDataLoading } =
    useChartDataQuery({
      variables: {
        chartId: props.targetableObject.id,
      },
    });
  const chartResult =
    chartDataResponse?.chartData.chartResult &&
    JSON.parse(chartDataResponse.chartData.chartResult);

  console.log('chartResult', chartResult);

  const loading: boolean = chartLoading || chartDataLoading;

  if (loading) return <SkeletonLoader />;

  if (!chart || !chartResult) throw new Error('Could not load chart');

  if (!chart?.groupBy) {
    return <div>{chartResult?.[0].measure}</div>;
  }

  return (
    <StyledChartContainer>
      <ResponsiveBar
        data={chartResult}
        keys={['measure']}
        indexBy={chart?.groupBy}
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.4}
        valueScale={{ type: 'linear' }}
        animate={true}
        enableLabel={false}
      />
    </StyledChartContainer>
  );
};
