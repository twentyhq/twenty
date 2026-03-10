import { recordIndexCommandMenuDropdownPositionComponentState } from '@/command-menu-item/states/recordIndexCommandMenuDropdownPositionComponentState';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { getCommandMenuIdFromRecordIndexId } from '@/command-menu-item/utils/getCommandMenuIdFromRecordIndexId';
import { RecordCalendarCardCellEditModePortal } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardCellEditModePortal';
import { RecordCalendarCardCellHoveredPortal } from '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardCellHoveredPortal';
import { RecordCalendarCardBody } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardBody';
import { RecordCalendarCardHeader } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardHeader';
import { RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardClickOutsideId';
import { RECORD_CALENDAR_CARD_INPUT_ID_PREFIX } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardInputIdPrefix';
import { RecordCalendarCardComponentInstanceContext } from '@/object-record/record-calendar/record-calendar-card/states/contexts/RecordCalendarCardComponentInstanceContext';
import { isRecordCalendarCardSelectedComponentFamilyState } from '@/object-record/record-calendar/record-calendar-card/states/isRecordCalendarCardSelectedComponentFamilyState';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { RecordCard } from '@/object-record/record-card/components/RecordCard';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { styled } from '@linaria/react';
import { AnimatedEaseInOut } from 'twenty-ui/utilities';

const StyledContainer = styled.div`
  display: flex;
`;

const StyledRecordCardContainer = styled.div`
  width: calc(100% - 2px);
`;

type RecordCalendarCardProps = {
  recordId: string;
};

export const RecordCalendarCard = ({ recordId }: RecordCalendarCardProps) => {
  const { currentView } = useGetCurrentViewOnly();

  const isCompactModeActive = currentView?.isCompact ?? false;
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
            <RecordCard
              data-selected={isRecordCalendarCardSelected}
              data-click-outside-id={RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID}
            >
              <RecordCalendarCardHeader recordId={recordId} />
              <AnimatedEaseInOut isOpen={!isCompactModeActive} initial={false}>
                <RecordCalendarCardBody
                  recordId={recordId}
                  isRecordReadOnly={false}
                />
              </AnimatedEaseInOut>
            </RecordCard>
          </StyledRecordCardContainer>
          <RecordCalendarCardCellHoveredPortal recordId={recordId} />
          <RecordCalendarCardCellEditModePortal recordId={recordId} />
        </StyledContainer>
      </RecordFieldsScopeContextProvider>
    </RecordCalendarCardComponentInstanceContext.Provider>
  );
};
