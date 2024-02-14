import { useRecoilState, useSetRecoilState } from 'recoil';

import { useCreateActivityInCache } from '@/activities/hooks/useCreateActivityInCache';
import { activityInDrawerState } from '@/activities/states/activityInDrawerState';
import { activityTargetableEntityArrayState } from '@/activities/states/activityTargetableEntityArrayState';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { temporaryActivityForEditorState } from '@/activities/states/temporaryActivityForEditorState';
import { viewableActivityIdState } from '@/activities/states/viewableActivityIdState';
import { ActivityType } from '@/activities/types/Activity';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';

import { ActivityTargetableObject } from '../types/ActivityTargetableEntity';

export const useOpenCreateActivityDrawerV2 = () => {
  const { openRightDrawer } = useRightDrawer();

  const setHotkeyScope = useSetHotkeyScope();

  const { createActivityInCache } = useCreateActivityInCache();

  const [, setActivityTargetableEntityArray] = useRecoilState(
    activityTargetableEntityArrayState,
  );
  const [, setViewableActivityId] = useRecoilState(viewableActivityIdState);

  const setIsCreatingActivity = useSetRecoilState(isActivityInCreateModeState);

  const setTemporaryActivityForEditor = useSetRecoilState(
    temporaryActivityForEditorState,
  );

  const setActivityInDrawer = useSetRecoilState(activityInDrawerState);

  const [, setIsUpsertingActivityInDB] = useRecoilState(
    isUpsertingActivityInDBState,
  );

  const openCreateActivityDrawer = async ({
    type,
    targetableObjects,
    timelineTargetableObject,
    assigneeId,
  }: {
    type: ActivityType;
    targetableObjects: ActivityTargetableObject[];
    timelineTargetableObject: ActivityTargetableObject;
    assigneeId?: string;
  }) => {
    const { createdActivityInCache } = createActivityInCache({
      type,
      targetableObjects,
      timelineTargetableObject,
      assigneeId,
    });

    setActivityInDrawer(createdActivityInCache);
    setTemporaryActivityForEditor(createdActivityInCache);
    setIsCreatingActivity(true);
    setHotkeyScope(RightDrawerHotkeyScope.RightDrawer, { goto: false });
    setViewableActivityId(createdActivityInCache.id);
    setActivityTargetableEntityArray(targetableObjects ?? []);
    openRightDrawer(RightDrawerPages.CreateActivity);
    setIsUpsertingActivityInDB(false);
  };

  return openCreateActivityDrawer;
};
