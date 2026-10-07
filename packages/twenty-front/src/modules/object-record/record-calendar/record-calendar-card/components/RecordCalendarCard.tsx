import { RecordCalendarCardCellEditModePortal } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardCellEditModePortal';
import { RecordCalendarCardCellHoveredPortal } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardCellHoveredPortal';
import { RecordCalendarCardBody } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardBody';
import { RecordCalendarCardHeader } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardHeader';
import { RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardClickOutsideId';
import { RecordCalendarCardComponentInstanceContext } from '@/object-record/record-calendar/record-calendar-card/states/contexts/RecordCalendarCardComponentInstanceContext';
import { RecordCard } from '@/object-record/record-card/components/RecordCard';
import { RecordDragMultiDragStack } from '@/object-record/record-drag/components/RecordDragMultiDragStack';
import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useOpenRecordContextMenu } from '@/object-record/record-selection/hooks/useOpenRecordContextMenu';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { styled } from '@linaria/react';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
`;

const StyledRecordCardContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  width: calc(100% - 2px);
`;

const StyledCardContainer = styled.div<{ isPrimaryMultiDrag?: boolean }>`
  position: relative;
  transform: ${({ isPrimaryMultiDrag }) =>
    isPrimaryMultiDrag ? 'scale(1.02)' : 'none'};
  z-index: ${({ isPrimaryMultiDrag }) => (isPrimaryMultiDrag ? '10' : 'auto')};
`;

type RecordCalendarCardProps = {
  recordId: string;
  calendarDay: string;
  isDragOverlay?: boolean;
};

export const RecordCalendarCard = ({
  recordId,
  calendarDay,
  isDragOverlay = false,
}: RecordCalendarCardProps) => {
  const { currentView } = useGetCurrentViewOnly();

  const isCompactModeActive = currentView?.isCompact ?? false;
  const isDraggingRecord = useAtomComponentStateValue(
    isDraggingRecordComponentState,
  );

  const isRecordIdSecondaryDragMultiple = useAtomComponentFamilyStateValue(
    isRecordIdSecondaryDragMultipleComponentFamilyState,
    { recordId },
  );

  const draggedRecordIds = useAtomComponentStateValue(
    draggedRecordIdsComponentState,
  );

  const isMultiDragOverlay = isDragOverlay && draggedRecordIds.length > 1;

  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  const isRecordSelected = useAtomComponentFamilyStateValue(
    isRecordSelectedComponentFamilyState,
    recordId,
  );

  const { openRecordContextMenu } = useOpenRecordContextMenu();

  const handleCardClick = () => {
    if (isDraggingRecord) {
      return;
    }

    openRecordFromIndexView({ recordId });
  };

  return (
    <RecordCalendarCardComponentInstanceContext.Provider
      value={{
        instanceId: `${recordId}-${calendarDay}`,
      }}
    >
      <StyledContainer
        onContextMenu={(event) => openRecordContextMenu({ event, recordId })}
      >
        <StyledRecordCardContainer>
          <StyledCardContainer isPrimaryMultiDrag={isMultiDragOverlay}>
            {isMultiDragOverlay && <RecordDragMultiDragStack />}
            <RecordCard
              data-selected={isRecordSelected}
              data-click-outside-id={RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID}
              onClick={isCompactModeActive ? handleCardClick : undefined}
              isDragging={!isDragOverlay && isRecordIdSecondaryDragMultiple}
            >
              <RecordCalendarCardHeader recordId={recordId} />
              <Collapsible isExpanded={!isCompactModeActive}>
                <RecordCalendarCardBody
                  recordId={recordId}
                  calendarDay={calendarDay}
                  isRecordReadOnly={false}
                />
              </Collapsible>
            </RecordCard>
          </StyledCardContainer>
        </StyledRecordCardContainer>
        {!isDragOverlay && (
          <>
            <RecordCalendarCardCellHoveredPortal
              recordId={recordId}
              calendarDay={calendarDay}
            />
            <RecordCalendarCardCellEditModePortal
              recordId={recordId}
              calendarDay={calendarDay}
            />
          </>
        )}
      </StyledContainer>
    </RecordCalendarCardComponentInstanceContext.Provider>
  );
};
