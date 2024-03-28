import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  RightDrawerHotkeyScope,
  RightDrawerPages,
  useRightDrawer,
  useSetHotkeyScope,
} from 'twenty-ui';

import { activityIdInDrawerState } from '@/activities/states/activityIdInDrawerState';

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
