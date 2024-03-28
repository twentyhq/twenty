import { RightDrawerPages } from 'packages/twenty-ui/src/layout/right-drawer/types/RightDrawerPages';
import { useSetRecoilState } from 'recoil';
import {
  RightDrawerHotkeyScope,
  useRightDrawer,
  useSetHotkeyScope,
} from 'twenty-ui';

import { viewableCalendarEventIdState } from '@/activities/calendar/states/viewableCalendarEventIdState';

export const useOpenCalendarEventRightDrawer = () => {
  const { openRightDrawer } = useRightDrawer();
  const setHotkeyScope = useSetHotkeyScope();
  const setViewableCalendarEventId = useSetRecoilState(
    viewableCalendarEventIdState(),
  );

  const openCalendarEventRightDrawer = (calendarEventId: string) => {
    setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    openRightDrawer(RightDrawerPages.ViewCalendarEvent);
    setViewableCalendarEventId(calendarEventId);
  };

  return { openCalendarEventRightDrawer };
};
