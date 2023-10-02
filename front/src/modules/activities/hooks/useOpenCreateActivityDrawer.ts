import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 } from 'uuid';

import { currentUserState } from '@/auth/states/currentUserState';
import { useRightDrawer } from '@/ui/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { ActivityType } from '~/generated/graphql';

import { activityTargetableEntityArrayState } from '../states/activityTargetableEntityArrayState';
import { currentActivityState } from '../states/currentActivityState';
import { ActivityTargetableEntity } from '../types/ActivityTargetableEntity';

export const useOpenCreateActivityDrawer = () => {
  const { openRightDrawer } = useRightDrawer();
  const currentUser = useRecoilValue(currentUserState);
  const setHotkeyScope = useSetHotkeyScope();

  const [, setActivityTargetableEntityArray] = useRecoilState(
    activityTargetableEntityArrayState,
  );

  const [, setCurrentActivity] = useRecoilState(currentActivityState);

  return ({
    type,
    targetableEntities,
    assigneeId,
  }: {
    type: ActivityType;
    targetableEntities?: ActivityTargetableEntity[];
    assigneeId?: string;
  }) => {
    setCurrentActivity({
      id: v4(),
      assignee: { connect: { id: assigneeId ?? currentUser?.id ?? '' } },
      type,
      targetableEntities,
    });

    setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    setActivityTargetableEntityArray(targetableEntities ?? []);
    openRightDrawer(RightDrawerPages.CreateActivity);
  };
};
