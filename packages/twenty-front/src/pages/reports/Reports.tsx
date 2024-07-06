import styled from '@emotion/styled';
import { IconReportAnalytics } from 'twenty-ui';

import { PageAddReportButton } from '@/activities/reports/components/PageAddReportButton';
import { REPORT_GROUP_TIME_SPANS } from '@/activities/reports/constants/ReportGroupTimeSpans';
// import { PageAddReportButton } from '@/activities/reports/components/PageAddReportButton';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';

import { ReportGroups } from '../../modules/activities/reports/components/ReportGroups';

const StyledReportsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const Reports = () => {
  const reportGroups: { groupName: string; reports: any[] }[] =
    REPORT_GROUP_TIME_SPANS.map((reportGroupTimeSpan) => {
      // TODO
      return {
        groupName: reportGroupTimeSpan.name,
        reports: [], // TODO
      };
    }).filter((reportGroup) => reportGroup.reports.length);

  return (
    <PageContainer>
      <RecordFieldValueSelectorContextProvider>
        <PageHeader title="Reports" Icon={IconReportAnalytics}>
          <PageAddReportButton />
        </PageHeader>
        <PageBody>
          <StyledReportsContainer>
            {reportGroups.map((groupedReport) => (
              <div>{groupedReport.groupName}</div>
            ))}
            <ReportGroups />
          </StyledReportsContainer>
        </PageBody>
      </RecordFieldValueSelectorContextProvider>
    </PageContainer>
  );
};
