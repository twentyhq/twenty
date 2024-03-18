import { useSetRecoilState } from 'recoil';

import { viewableCalendarEventIdState } from '@/activities/calendar/states/viewableCalendarEventIdState';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

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
