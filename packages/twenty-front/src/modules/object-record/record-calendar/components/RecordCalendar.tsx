import styled from '@emotion/styled';

import { ACTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/action-menu/constants/ActionMenuDropdownClickOutsideId';
import { COMMAND_MENU_CLICK_OUTSIDE_ID } from '@/command-menu/constants/CommandMenuClickOutsideId';
import { RecordCalendarTopBar } from '@/object-record/record-calendar/components/RecordCalendarTopBar';
import { RECORD_CALENDAR_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-calendar/constants/RecordCalendarClickOutsideListenerId';
import { RecordCalendarMonth } from '@/object-record/record-calendar/month/components/RecordCalendarMonth';
import { RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardClickOutsideId';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { useRecordCalendarSelection } from '@/object-record/record-calendar/states/selectors/useRecordCalendarSelection';
import { MODAL_BACKDROP_CLICK_OUTSIDE_ID } from '@/ui/layout/modal/constants/ModalBackdropClickOutsideId';
import { PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID } from '@/ui/layout/page/constants/PageActionContainerClickOutsideId';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { LINK_CHIP_CLICK_OUTSIDE_ID } from 'twenty-ui/components';

const StyledContainerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: inherit;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

export const RecordCalendar = () => {
  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );

  const { resetRecordSelection } = useRecordCalendarSelection(recordCalendarId);

  useListenClickOutside({
    excludedClickOutsideIds: [
      ACTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID,
      COMMAND_MENU_CLICK_OUTSIDE_ID,
      MODAL_BACKDROP_CLICK_OUTSIDE_ID,
      PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID,
      RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID,
      LINK_CHIP_CLICK_OUTSIDE_ID,
    ],
    listenerId: RECORD_CALENDAR_CLICK_OUTSIDE_LISTENER_ID,
    refs: [],
    callback: () => {
      resetRecordSelection();
    },
  });

  return (
    <StyledContainerContainer>
      <RecordCalendarTopBar />
      <ScrollWrapper
        componentInstanceId={`scroll-wrapper-record-calendar-${recordCalendarId}`}
      >
        <RecordCalendarMonth />
      </ScrollWrapper>
    </StyledContainerContainer>
  );
};
