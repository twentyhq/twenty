import { useSetRecoilState } from 'recoil';

import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

export const useOpenCalendarEventRightDrawer = () => {
  const { openRightDrawer } = useRightDrawer();
  const setHotkeyScope = useSetHotkeyScope();
  const setViewableRecordId = useSetRecoilState(viewableRecordIdState);

  const openCalendarEventRightDrawer = (calendarEventId: string) => {
    setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    openRightDrawer(RightDrawerPages.ViewCalendarEvent);
    setViewableRecordId(calendarEventId);
  };

  return { openCalendarEventRightDrawer };
};
