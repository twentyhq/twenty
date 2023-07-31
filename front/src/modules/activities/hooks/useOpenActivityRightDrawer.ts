import { useRecoilState } from 'recoil';

import { useRightDrawer } from '@/ui/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { viewableActivityIdState } from '../states/viewableActivityIdState';

export function useOpenActivityRightDrawer() {
  const { openRightDrawer } = useRightDrawer();
  const [, setViewableActivityId] = useRecoilState(viewableActivityIdState);
  const setHotkeyScope = useSetHotkeyScope();

  return function openActivityRightDrawer(activityId: string) {
    setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    setViewableActivityId(activityId);
    openRightDrawer(RightDrawerPages.EditActivity);
  };
}
