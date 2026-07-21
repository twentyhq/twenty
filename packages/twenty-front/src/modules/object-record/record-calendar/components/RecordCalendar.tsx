import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';

import { COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/command-menu-item/constants/CommandMenuDropdownClickOutsideId';
import { COMMAND_MENU_CLICK_OUTSIDE_ID } from '@/command-menu/constants/CommandMenuClickOutsideId';
import { RecordCalendarTopBar } from '@/object-record/record-calendar/components/RecordCalendarTopBar';
import { RECORD_CALENDAR_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-calendar/constants/RecordCalendarClickOutsideListenerId';
import { RecordCalendarDay } from '@/object-record/record-calendar/day/components/RecordCalendarDay';
import { RecordCalendarMonth } from '@/object-record/record-calendar/month/components/RecordCalendarMonth';
import { RecordCalendarWeek } from '@/object-record/record-calendar/week/components/RecordCalendarWeek';
import { RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardClickOutsideId';
import { recordIndexCalendarLayoutComponentState } from '@/object-record/record-index/states/recordIndexCalendarLayoutComponentState';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { useRecordCalendarSelection } from '@/object-record/record-calendar/states/selectors/useRecordCalendarSelection';
import { getSupportedRecordCalendarLayout } from '@/object-record/record-calendar/utils/getSupportedRecordCalendarLayout';
import { MODAL_BACKDROP_CLICK_OUTSIDE_ID } from '@/ui/layout/modal/constants/ModalBackdropClickOutsideId';
import { PAGE_ACTION_CONTAINER_CLICK_OUTSIDE_ID } from '@/ui/layout/page/constants/PageActionContainerClickOutsideId';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useEffect } from 'react';
import { LINK_CHIP_CLICK_OUTSIDE_ID } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  FeatureFlagKey,
  ViewCalendarLayout,
} from '~/generated-metadata/graphql';

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

  const { resetRecordSelection } = useRecordCalendarSelection(recordCalendarId);

  const recordIndexCalendarLayout = useAtomComponentStateValue(
    recordIndexCalendarLayoutComponentState,
  );
  const isCalendarWeekViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED,
  );
  const supportedCalendarLayout = getSupportedRecordCalendarLayout({
    calendarLayout: recordIndexCalendarLayout,
    isCalendarWeekViewEnabled,
  });

  useEffect(() => {
    resetRecordSelection();
  }, [resetRecordSelection, supportedCalendarLayout]);

  useListenClickOutside({
    excludedClickOutsideIds: [
      COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID,
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
        {supportedCalendarLayout === ViewCalendarLayout.DAY ? (
          <RecordCalendarDay />
        ) : supportedCalendarLayout === ViewCalendarLayout.WEEK ? (
          <RecordCalendarWeek />
        ) : (
          <RecordCalendarMonth />
        )}
      </ScrollWrapper>
    </StyledContainerContainer>
  );
};
