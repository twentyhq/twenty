import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { IconPlus } from 'twenty-ui';

import { Chart } from '@/activities/reports/components/Chart';
import { ReportsLayout } from '@/activities/reports/components/ReportsLayout';
import { Chart as ChartType } from '@/activities/reports/types/Chart';
import { Report } from '@/activities/reports/types/Report';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { Button } from '@/ui/input/button/components/Button';

const StyledChartsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

const StyledChartContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Charts = () => {
  const reportId = useParams().reportId ?? '';

  const navigate = useNavigate();

  // TODO: Combine find queries into one graphql query?

  const { record: report } = useFindOneRecord<Report>({
    objectNameSingular: CoreObjectNameSingular.Report,
    objectRecordId: reportId,
  });

  const { records: charts } = useFindManyRecords<ChartType>({
    objectNameSingular: CoreObjectNameSingular.Chart,
  });

  const { createOneRecord: createOneChart } = useCreateOneRecord<ChartType>({
    objectNameSingular: CoreObjectNameSingular.Chart,
  });

  return (
    <ReportsLayout hasBackButton>
      <StyledChartsContainer>
        <div>{report?.title}</div>
        {charts.map((chart) => (
          <StyledChartContainer
            onClick={async () => {
              await navigate(`/reports/${reportId}/charts/${chart.id}`);
            }}
          >
            <Chart chart={chart} />
          </StyledChartContainer>
        ))}
        <Button
          Icon={IconPlus}
          title="New chart"
          variant={'secondary'}
          onClick={async () => {
            const chart = await createOneChart({ title: 'New Chart' });
            await navigate(`/reports/${reportId}/charts/${chart.id}`);
          }}
        />
      </StyledChartsContainer>
    </ReportsLayout>
  );
};
