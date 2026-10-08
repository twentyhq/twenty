import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';

import { COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/command-menu-item/constants/CommandMenuDropdownClickOutsideId';
import { COMMAND_MENU_CLICK_OUTSIDE_ID } from '@/command-menu/constants/CommandMenuClickOutsideId';
import { RecordCalendarTopBar } from '@/object-record/record-calendar/components/RecordCalendarTopBar';
import { RECORD_CALENDAR_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-calendar/constants/RecordCalendarClickOutsideListenerId';
import { RecordCalendarGrid } from '@/object-record/record-calendar/grid/components/RecordCalendarGrid';
import { RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardClickOutsideId';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordIndexCalendarLayoutComponentState } from '@/object-record/record-index/states/recordIndexCalendarLayoutComponentState';
import { RecordSelectionEscapeHotkeyEffect } from '@/object-record/record-selection/components/RecordSelectionEscapeHotkeyEffect';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { DIALOG_BACKDROP_CLICK_OUTSIDE_ID } from '@/ui/layout/dialog/constants/DialogBackdropClickOutsideId';
import { PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID } from '@/ui/layout/page/constants/PageActionContainerClickOutsideId';
import { LINK_CHIP_CLICK_OUTSIDE_ID } from '@/ui/navigation/link/constants/LinkChipClickOutsideId';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useEffect } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainerContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  height: 100%;
  padding: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[1]};
`;

export const RecordCalendar = () => {
  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );

  const { resetRecordSelection } = useResetRecordSelection(recordCalendarId);

  const recordIndexCalendarLayout = useAtomComponentStateValue(
    recordIndexCalendarLayoutComponentState,
  );

  useEffect(() => {
    resetRecordSelection();
  }, [resetRecordSelection, recordIndexCalendarLayout]);

  useListenClickOutside({
    excludedClickOutsideIds: [
      COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID,
      COMMAND_MENU_CLICK_OUTSIDE_ID,
      DIALOG_BACKDROP_CLICK_OUTSIDE_ID,
      PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID,
      RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID,
      LINK_CHIP_CLICK_OUTSIDE_ID,
    ],
    listenerId: RECORD_CALENDAR_CLICK_OUTSIDE_LISTENER_ID,
    refs: [],
    callback: resetRecordSelection,
  });

  return (
    <StyledContainerContainer>
      <RecordSelectionEscapeHotkeyEffect />
      <RecordCalendarTopBar />
      <ScrollWrapper
        componentInstanceId={`scroll-wrapper-record-calendar-${recordCalendarId}`}
      >
        <RecordCalendarGrid calendarLayout={recordIndexCalendarLayout} />
      </ScrollWrapper>
    </StyledContainerContainer>
  );
};
