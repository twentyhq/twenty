import { useParams } from 'react-router-dom';
import styled from '@emotion/styled';

import { AnalyticsQueryEditor } from '@/activities/charts/components/AnalyticsQueryEditor';
import { Chart } from '@/activities/charts/components/Chart';
import { ChartConfig } from '@/activities/charts/components/ChartConfig';
import { Chart as ChartType } from '@/activities/charts/types/Chart';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';

const StyledChartEditorContainer = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  overflow: auto;
`;

export const ChartEditor = () => {
  const { chartId } = useParams();

  const { record: chart } = useFindOneRecord<ChartType>({
    objectNameSingular: CoreObjectNameSingular.Chart,
    objectRecordId: chartId,
  });

  return (
    <StyledChartEditorContainer>
      {chart && <Chart chart={chart} />}
      <AnalyticsQueryEditor analyticsQuery={chart?.analyticsQueries?.[0]} />
      <ChartConfig chart={chart} />
    </StyledChartEditorContainer>
  );
};
