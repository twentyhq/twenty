import { RecordCard } from '@/object-record/record-card/components/RecordCard';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

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
  const record = useRecoilValue(recordStoreFamilyState(recordId));

  return (
    <StyledContainer>
      <StyledRecordCard>{record?.id}</StyledRecordCard>
    </StyledContainer>
  );
};
