import { RecordCalendarCardCellEditModePortal } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardCellEditModePortal';
import { RecordCalendarCardCellHoveredPortal } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardCellHoveredPortal';
import { RecordCalendarCardBody } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardBody';
import { RecordCalendarCardHeader } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardHeader';
import { RecordCalendarCardComponentInstanceContext } from '@/object-record/record-calendar/record-calendar-card/states/contexts/RecordCalendarCardComponentInstanceContext';
import { RecordCard } from '@/object-record/record-card/components/RecordCard';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import styled from '@emotion/styled';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';

const StyledContainer = styled.div`
  display: flex;
`;

const StyledRecordCard = styled(RecordCard)`
  width: calc(100% - 2px);
`;

type RecordCalendarCardProps = {
  recordId: string;
};

export const RecordCalendarCard = ({ recordId }: RecordCalendarCardProps) => {
  const { currentView } = useGetCurrentViewOnly();

  const isCompactModeActive = currentView?.isCompact ?? false;

  return (
    <RecordCalendarCardComponentInstanceContext.Provider
      value={{
        instanceId: recordId,
      }}
    >
      <StyledContainer>
        <StyledRecordCard>
          <RecordCalendarCardHeader recordId={recordId} />
          <AnimatedEaseInOut isOpen={!isCompactModeActive} initial={false}>
            <RecordCalendarCardBody
              recordId={recordId}
              isRecordReadOnly={false}
            />
          </AnimatedEaseInOut>
        </StyledRecordCard>
        <RecordCalendarCardCellHoveredPortal recordId={recordId} />
        <RecordCalendarCardCellEditModePortal recordId={recordId} />
      </StyledContainer>
    </RecordCalendarCardComponentInstanceContext.Provider>
  );
};
