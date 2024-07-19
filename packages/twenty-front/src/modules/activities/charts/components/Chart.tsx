import styled from '@emotion/styled';
import { ResponsiveBar } from '@nivo/bar';

import { Chart as ChartType } from '@/activities/charts/types/Chart';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useRunChartQueryMutation } from '~/generated/graphql';

const StyledChartContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
`;

interface ChartProps {
  targetableObject: ActivityTargetableObject;
}

export const Chart = (props: ChartProps) => {
  const { record: chart, loading } = useFindOneRecord<ChartType>({
    objectRecordId: props.targetableObject.id,
    objectNameSingular: props.targetableObject.targetObjectNameSingular,
  });

  const [runChartQuery] = useRunChartQueryMutation({
    variables: {
      chartId: props.targetableObject.id,
    },
  });

  if (loading) return <SkeletonLoader />;

  if (!chart) throw new Error('Could not load chart');

  return (
    <>
      <StyledChartContainer>
        <button
          onClick={async () => {
            await runChartQuery();
          }}
        >
          Run query
        </button>
        <p>{chart.result}</p>
        {/* TODO: Nivo charts */}
      </StyledChartContainer>
      <ResponsiveBar
        data={[
          {
            day: 'Monday',
            degress: 59,
          },
          {
            day: 'Tuesday',
            degress: 61,
          },
        ]}
        keys={['degress']}
        indexBy="day"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.4}
        valueScale={{ type: 'linear' }}
        animate={true}
        enableLabel={false}
      />
    </>
  );
};
