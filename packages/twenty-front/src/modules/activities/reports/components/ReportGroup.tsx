import styled from '@emotion/styled';

import { ReportRow } from '@/activities/reports/components/ReportRow';
import { Report } from '@/activities/reports/types/Report';

interface ReportGroupProps {
  title?: string;
  reports: Report[];
}

const StyledContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 24px;
`;

const StyledTitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  place-items: center;
  width: 100%;
`;

// H1Title instead?
const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledCount = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledReportRows = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  width: 100%;
`;

export const ReportGroup = (props: ReportGroupProps) => (
  <>
    {props.reports && props.reports.length > 0 && (
      <StyledContainer>
        <StyledTitleBar>
          {props.title && (
            <StyledTitle>
              {props.title} <StyledCount>{props.reports.length}</StyledCount>
            </StyledTitle>
          )}
        </StyledTitleBar>
        <StyledReportRows>
          {props.reports.map((report) => (
            <ReportRow key={report.id} report={report} />
          ))}
        </StyledReportRows>
      </StyledContainer>
    )}
  </>
);
