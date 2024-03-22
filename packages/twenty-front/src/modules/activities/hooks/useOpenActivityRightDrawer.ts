import { useRecoilState, useSetRecoilState } from 'recoil';

import { activityIdInDrawerState } from '@/activities/states/activityIdInDrawerState';
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
  const setActivityIdInDrawer = useSetRecoilState(activityIdInDrawerState);
  const setHotkeyScope = useSetHotkeyScope();

  return (activityId: string) => {
    if (
      isRightDrawerOpen &&
      rightDrawerPage === RightDrawerPages.EditActivity &&
      viewableActivityId === activityId
    ) {
      return;
    }

    setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    setViewableActivityId(activityId);
    setActivityIdInDrawer(activityId);
    openRightDrawer(RightDrawerPages.EditActivity);
  };
};
