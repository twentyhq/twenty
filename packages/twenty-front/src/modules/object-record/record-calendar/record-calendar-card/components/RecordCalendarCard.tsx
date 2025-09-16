import { isRecordBoardCompactModeActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCompactModeActiveComponentState';
import { RecordCalendarCardCellEditModePortal } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardCellEditModePortal';
import { RecordCalendarCardCellHoveredPortal } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardCellHoveredPortal';
import { RecordCalendarCardBody } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardBody';
import { RecordCalendarCardHeader } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardHeader';
import { RecordCalendarCardComponentInstanceContext } from '@/object-record/record-calendar/record-calendar-card/states/contexts/RecordCalendarCardComponentInstanceContext';
import { RecordCard } from '@/object-record/record-card/components/RecordCard';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
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
  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  const { recordIndexId } = useRecordIndexIdFromCurrentContextStore();

  const [isCompactModeActive] = useRecoilComponentState(
    isRecordBoardCompactModeActiveComponentState,
    recordIndexId,
  );

  const handleCardClick = () => {
    openRecordFromIndexView({ recordId });
  };

  return (
    <RecordCalendarCardComponentInstanceContext.Provider
      value={{
        instanceId: recordId,
      }}
    >
      <StyledContainer>
        <StyledRecordCard onClick={handleCardClick}>
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
