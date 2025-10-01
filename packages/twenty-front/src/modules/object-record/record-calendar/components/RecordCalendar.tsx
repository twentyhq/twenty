import styled from '@emotion/styled';

import { RecordCalendarTopBar } from '@/object-record/record-calendar/components/RecordCalendarTopBar';
import { RecordCalendarMonth } from '@/object-record/record-calendar/month/components/RecordCalendarMonth';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { ACTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/action-menu/constants/ActionMenuDropdownClickOutsideId';
import { COMMAND_MENU_CLICK_OUTSIDE_ID } from '@/command-menu/constants/CommandMenuClickOutsideId';
import { MODAL_BACKDROP_CLICK_OUTSIDE_ID } from '@/ui/layout/modal/constants/ModalBackdropClickOutsideId';
import { PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID } from '@/ui/layout/page/constants/PageActionContainerClickOutsideId';
import { RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardClickOutsideId';
import { LINK_CHIP_CLICK_OUTSIDE_ID } from 'twenty-ui/components';
import { useRecordCalendarSelection } from '@/object-record/record-calendar/states/selectors/useRecordCalendarSelection';
import { RECORD_CALENDAR_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-calendar/constants/RecordCalendarClickOutsideListenerId';

const StyledContainerContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100% - ${({ theme }) => theme.spacing(2)});
  height: min-content;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
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
    <ScrollWrapper
      componentInstanceId={`scroll-wrapper-record-calendar-${recordCalendarId}`}
    >
      <StyledContainerContainer>
        <RecordCalendarTopBar />
        <RecordCalendarMonth />
      </StyledContainerContainer>
    </ScrollWrapper>
  );
};
