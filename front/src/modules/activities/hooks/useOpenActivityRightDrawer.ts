import { useRecoilState } from 'recoil';

import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { viewableActivityIdState } from '../states/viewableActivityIdState';

export const useOpenActivityRightDrawer = () => {
  const { openRightDrawer } = useRightDrawer();
  const [, setViewableActivityId] = useRecoilState(viewableActivityIdState);
  const setHotkeyScope = useSetHotkeyScope();

  return (activityId: string) => {
    setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    setViewableActivityId(activityId);
    openRightDrawer(RightDrawerPages.EditActivity);
  };
};
