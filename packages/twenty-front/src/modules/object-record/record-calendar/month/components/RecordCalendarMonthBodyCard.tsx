import { RecordCalendarCardBody } from '@/object-record/record-calendar/card/components/RecordCalendarCardBody';
import { RecordCalendarCardHeader } from '@/object-record/record-calendar/card/components/RecordCalendarCardHeader';
import { RecordCard } from '@/object-record/record-card/components/RecordCard';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  display: flex;
`;

const StyledRecordCard = styled(RecordCard)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

type RecordCalendarMonthBodyCardProps = {
  recordId: string;
};

export const RecordCalendarMonthBodyCard = ({
  recordId,
}: RecordCalendarMonthBodyCardProps) => {
  return (
    <StyledContainer>
      <StyledRecordCard>
        <RecordCalendarCardHeader recordId={recordId} />
        <RecordCalendarCardBody recordId={recordId} isRecordReadOnly={false} />
      </StyledRecordCard>
    </StyledContainer>
  );
};
