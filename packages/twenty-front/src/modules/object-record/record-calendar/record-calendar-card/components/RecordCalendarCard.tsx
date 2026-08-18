import { recordIndexCommandMenuDropdownPositionComponentState } from '@/command-menu-item/states/recordIndexCommandMenuDropdownPositionComponentState';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { getCommandMenuIdFromRecordIndexId } from '@/command-menu-item/utils/getCommandMenuIdFromRecordIndexId';
import { RecordCalendarCardCellEditModePortal } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardCellEditModePortal';
import { RecordCalendarCardCellHoveredPortal } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardCellHoveredPortal';
import { RecordCalendarCardBody } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardBody';
import { RecordCalendarCardHeader } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardHeader';
import { RecordDragMultiDragStack } from '@/object-record/record-drag/components/RecordDragMultiDragStack';
import { RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardClickOutsideId';
import { RECORD_CALENDAR_CARD_INPUT_ID_PREFIX } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardInputIdPrefix';
import { RecordCalendarCardComponentInstanceContext } from '@/object-record/record-calendar/record-calendar-card/states/contexts/RecordCalendarCardComponentInstanceContext';
import { isRecordCalendarCardSelectedComponentFamilyState } from '@/object-record/record-calendar/record-calendar-card/states/isRecordCalendarCardSelectedComponentFamilyState';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { RecordCard } from '@/object-record/record-card/components/RecordCard';
import { isDraggingRecordComponentState } from '@/object-record/record-drag/states/isDraggingRecordComponentState';
import { isRecordIdPrimaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdPrimaryDragMultipleComponentFamilyState';
import { isRecordIdSecondaryDragMultipleComponentFamilyState } from '@/object-record/record-drag/states/isRecordIdSecondaryDragMultipleComponentFamilyState';
import { primaryDraggedRecordIdComponentState } from '@/object-record/record-drag/states/primaryDraggedRecordIdComponentState';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';
import { AnimatedEaseInOut } from 'twenty-ui/layout';

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
  isDragOverlay?: boolean;
};

export const RecordCalendarCard = ({
  recordId,
  isDragOverlay = false,
}: RecordCalendarCardProps) => {
  const { currentView } = useGetCurrentViewOnly();

  const isCompactModeActive = currentView?.isCompact ?? false;
  const isDraggingRecord = useAtomComponentStateValue(
    isDraggingRecordComponentState,
  );

  const isRecordIdPrimaryDragMultiple = useAtomComponentFamilyStateValue(
    isRecordIdPrimaryDragMultipleComponentFamilyState,
    { recordId },
  );

  const isRecordIdSecondaryDragMultiple = useAtomComponentFamilyStateValue(
    isRecordIdSecondaryDragMultipleComponentFamilyState,
    { recordId },
  );

  const primaryDraggedRecordId = useAtomComponentStateValue(
    primaryDraggedRecordIdComponentState,
  );

  const isDraggingThisCard =
    !isDragOverlay &&
    (isRecordIdPrimaryDragMultiple ||
      isRecordIdSecondaryDragMultiple ||
      primaryDraggedRecordId === recordId);

  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  const [isRecordCalendarCardSelected, setIsRecordCalendarCardSelected] =
    useAtomComponentFamilyState(
      isRecordCalendarCardSelectedComponentFamilyState,
      recordId,
    );

  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );

  const commandMenuId = getCommandMenuIdFromRecordIndexId(recordCalendarId);

  const commandMenuDropdownId =
    getCommandMenuDropdownIdFromCommandMenuId(commandMenuId);

  const setRecordIndexCommandMenuDropdownPosition = useSetAtomComponentState(
    recordIndexCommandMenuDropdownPositionComponentState,
    commandMenuDropdownId,
  );

  const { openDropdown } = useOpenDropdown();

  const handleCardClick = () => {
    if (isDraggingRecord) {
      return;
    }

    openRecordFromIndexView({ recordId });
  };

  const handleContextMenuOpen = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsRecordCalendarCardSelected(true);
    setRecordIndexCommandMenuDropdownPosition({
      x: event.clientX,
      y: event.clientY,
    });
    openDropdown({
      dropdownComponentInstanceIdFromProps: commandMenuDropdownId,
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  return (
    <RecordCalendarCardComponentInstanceContext.Provider
      value={{
        instanceId: recordId,
      }}
    >
      <RecordFieldsScopeContextProvider
        value={{ scopeInstanceId: RECORD_CALENDAR_CARD_INPUT_ID_PREFIX }}
      >
        <StyledContainer onContextMenu={handleContextMenuOpen}>
          <StyledRecordCardContainer>
            <StyledCardContainer
              isPrimaryMultiDrag={
                isDragOverlay && isRecordIdPrimaryDragMultiple
              }
            >
              {isDragOverlay && isRecordIdPrimaryDragMultiple && (
                <RecordDragMultiDragStack />
              )}
              <RecordCard
                data-selected={isRecordCalendarCardSelected}
                data-click-outside-id={RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID}
                onClick={isCompactModeActive ? handleCardClick : undefined}
                isDragging={isDraggingThisCard}
              >
                <RecordCalendarCardHeader recordId={recordId} />
                <AnimatedEaseInOut
                  isOpen={!isCompactModeActive}
                  initial={false}
                >
                  <RecordCalendarCardBody
                    recordId={recordId}
                    isRecordReadOnly={false}
                  />
                </AnimatedEaseInOut>
              </RecordCard>
            </StyledCardContainer>
          </StyledRecordCardContainer>
          {!isDragOverlay && (
            <>
              <RecordCalendarCardCellHoveredPortal recordId={recordId} />
              <RecordCalendarCardCellEditModePortal recordId={recordId} />
            </>
          )}
        </StyledContainer>
      </RecordFieldsScopeContextProvider>
    </RecordCalendarCardComponentInstanceContext.Provider>
  );
};
