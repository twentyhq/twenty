import styled from '@emotion/styled';
import { IconReportAnalytics } from 'twenty-ui';

import { REPORT_GROUPS } from '@/activities/reports/constants/ReportGroups';
// import { PageAddReportButton } from '@/activities/reports/components/PageAddReportButton';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';

const StyledReportsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const Reports = () => {
  const groupedReports: { groupName: string; reports: any[] }[] =
    REPORT_GROUPS.map((groupedReport) => {
      // TODO
      return {
        groupName: groupedReport.name,
        reports: [], // TODO
      };
    }).filter((groupedReport) => groupedReport.reports.length);

  return (
    <PageContainer>
      <RecordFieldValueSelectorContextProvider>
        <PageHeader title="Reports" Icon={IconReportAnalytics}>
          {/* <PageAddReportButton /> */}
        </PageHeader>
        <PageBody>
          <StyledReportsContainer>
            {groupedReports.map((groupedReport) => (
              <div>{groupedReport.groupName}</div>
            ))}
          </StyledReportsContainer>
        </PageBody>
      </RecordFieldValueSelectorContextProvider>
    </PageContainer>
  );
};
