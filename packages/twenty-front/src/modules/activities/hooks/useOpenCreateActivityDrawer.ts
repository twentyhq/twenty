import { useRecoilState, useSetRecoilState } from 'recoil';

import { useCreateActivityInCache } from '@/activities/hooks/useCreateActivityInCache';
import { activityIdInDrawerState } from '@/activities/states/activityIdInDrawerState';
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
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

import { ActivityTargetableObject } from '../types/ActivityTargetableEntity';

export const useOpenCreateActivityDrawer = () => {
  const { openRightDrawer } = useRightDrawer();

  const setHotkeyScope = useSetHotkeyScope();

  const { createActivityInCache } = useCreateActivityInCache();

  const setActivityTargetableEntityArray = useSetRecoilState(
    activityTargetableEntityArrayState,
  );
  const setViewableActivityId = useSetRecoilState(viewableActivityIdState);

  const setIsCreatingActivity = useSetRecoilState(isActivityInCreateModeState);

  const setTemporaryActivityForEditor = useSetRecoilState(
    temporaryActivityForEditorState,
  );

  const setActivityIdInDrawer = useSetRecoilState(activityIdInDrawerState);

  const [, setIsUpsertingActivityInDB] = useRecoilState(
    isUpsertingActivityInDBState,
  );

  const openCreateActivityDrawer = async ({
    type,
    targetableObjects,
    customAssignee,
  }: {
    type: ActivityType;
    targetableObjects: ActivityTargetableObject[];
    customAssignee?: WorkspaceMember;
  }) => {
    const { createdActivityInCache } = createActivityInCache({
      type,
      targetObject: targetableObjects[0],
      customAssignee,
    });

    setActivityIdInDrawer(createdActivityInCache.id);
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
