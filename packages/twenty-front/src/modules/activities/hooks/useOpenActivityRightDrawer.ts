import { useRecoilState } from 'recoil';

import { activityInDrawerState } from '@/activities/states/activityInDrawerState';
import { Activity } from '@/activities/types/Activity';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { viewableActivityIdState } from '../states/viewableActivityIdState';

export const useOpenActivityRightDrawer = () => {
  const { openRightDrawer, isRightDrawerOpen, rightDrawerPage } =
    useRightDrawer();
  const [viewableActivityId, setViewableActivityId] = useRecoilState(
    viewableActivityIdState,
  );
  const [, setActivityInDrawer] = useRecoilState(activityInDrawerState);
  const setHotkeyScope = useSetHotkeyScope();

  return (activity: Activity) => {
    if (
      isRightDrawerOpen &&
      rightDrawerPage === RightDrawerPages.EditActivity &&
      viewableActivityId === activity.id
    ) {
      return;
    }

    setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    setViewableActivityId(activity.id);
    setActivityInDrawer(activity);
    openRightDrawer(RightDrawerPages.EditActivity);
  };
};
