import { useRecoilState } from 'recoil';

import { useRightDrawer } from '@/ui/Layout/Right Drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/Layout/Right Drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/Layout/Right Drawer/types/RightDrawerPages';
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
