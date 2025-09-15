import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCard } from '@/object-record/record-card/components/RecordCard';
import { RecordCardHeader } from '@/object-record/record-card/components/RecordCardHeader';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
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
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();

  return (
    <StyledContainer>
      <StyledRecordCard>
        <RecordCardHeader
          objectMetadataItem={objectMetadataItem}
          recordId={recordId}
          onTitleClick={() => {}}
          onCompactIconClick={() => {}}
          onCheckboxChange={() => {}}
          isCompactView={true}
          isCurrentCardSelected={false}
          isCompactViewToggleable={false}
          isIconHidden={true}
          recordIndexOpenRecordIn={ViewOpenRecordInType.SIDE_PANEL}
        />
      </StyledRecordCard>
    </StyledContainer>
  );
};
