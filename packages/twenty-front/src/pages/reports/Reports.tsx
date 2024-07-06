import styled from '@emotion/styled';

import { ReportsLayout } from '@/activities/reports/components/ReportsLayout';

import { ReportGroups } from '../../modules/activities/reports/components/ReportGroups';

const StyledReportsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const Reports = () => {
  return (
    <ReportsLayout>
      <StyledReportsContainer>
        <ReportGroups />
      </StyledReportsContainer>
    </ReportsLayout>
  );
};
