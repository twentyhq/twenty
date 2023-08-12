import { useRecoilState } from 'recoil';

import { useRightDrawer } from '@/ui/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { activityTargetableEntityArrayState } from '../states/activityTargetableEntityArrayState';
import { ActivityTargetableEntity } from '../types/ActivityTargetableEntity';

// TODO: refactor with recoil callback to avoid rerender
export function useOpenTimelineRightDrawer() {
  const { openRightDrawer } = useRightDrawer();
  const [, setActivityTargetableEntityArray] = useRecoilState(
    activityTargetableEntityArrayState,
  );
  const setHotkeyScope = useSetHotkeyScope();

  return function openTimelineRightDrawer(
    activityTargetableEntityArray: ActivityTargetableEntity[],
  ) {
    setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    setActivityTargetableEntityArray(activityTargetableEntityArray);
    openRightDrawer(RightDrawerPages.Timeline);
  };
}
