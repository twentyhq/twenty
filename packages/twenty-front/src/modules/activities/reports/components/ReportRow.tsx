import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { Report } from '@/activities/reports/types/Report';
import { beautifyExactDate } from '~/utils/date-utils';

const StyledContainer = styled.div`
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  cursor: pointer;
  display: inline-flex;
  height: ${({ theme }) => theme.spacing(12)};
  min-width: calc(100% - ${({ theme }) => theme.spacing(8)});
  padding: 0 ${({ theme }) => theme.spacing(4)};

  &:last-child {
    border-bottom: 0;
  }
`;

const StyledReportTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledDueDate = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  white-space: nowrap;
`;

const StyledRightSideContainer = styled.div`
  display: flex;
`;

const StyledPlaceholder = styled.div`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledLeftSideContainer = styled.div`
  display: flex;
`;

interface ReportRowProps {
  report: Report;
}

export const ReportRow = (props: ReportRowProps) => {
  const navigate = useNavigate();

  return (
    <StyledContainer
      onClick={async () => {
        await navigate(`/reports/${props.report.id}/charts`);
      }}
    >
      <StyledLeftSideContainer>
        <StyledReportTitle>
          {props.report.title || (
            <StyledPlaceholder>Report title</StyledPlaceholder>
          )}
        </StyledReportTitle>
        {/* TODO: List chart names and +1 sign if not fitting in view */}
      </StyledLeftSideContainer>
      <StyledRightSideContainer>
        <StyledDueDate>
          {props.report.createdAt && beautifyExactDate(props.report.createdAt)}
        </StyledDueDate>
      </StyledRightSideContainer>
    </StyledContainer>
  );
};
