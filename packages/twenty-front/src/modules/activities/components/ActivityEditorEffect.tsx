import { useRecoilCallback } from 'recoil';

import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { activityBodyFamilyState } from '@/activities/states/activityBodyFamilyState';
import { activityTitleFamilyState } from '@/activities/states/activityTitleFamilyState';
import { canCreateActivityState } from '@/activities/states/canCreateActivityState';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { Activity } from '@/activities/types/Activity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteRecordFromCache } from '@/object-record/cache/hooks/useDeleteRecordFromCache';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID } from '@/ui/layout/right-drawer/constants/RightDrawerClickOutsideListener';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { isDefined } from '~/utils/isDefined';

export const ActivityEditorEffect = ({
  activityId,
}: {
  activityId: string;
}) => {
  const { useRegisterClickOutsideListenerCallback } = useClickOutsideListener(
    RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID,
  );

  const { upsertActivity } = useUpsertActivity();
  const deleteRecordFromCache = useDeleteRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.Activity,
  });

  const upsertActivityCallback = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const isUpsertingActivityInDB = snapshot
          .getLoadable(isUpsertingActivityInDBState)
          .getValue();

        const canCreateActivity = snapshot
          .getLoadable(canCreateActivityState)
          .getValue();

        const isActivityInCreateMode = snapshot
          .getLoadable(isActivityInCreateModeState)
          .getValue();

        const activityFromStore = snapshot
          .getLoadable(recordStoreFamilyState(activityId))
          .getValue();

        const activity = activityFromStore as Activity | null;

        const activityTitle = snapshot
          .getLoadable(activityTitleFamilyState({ activityId }))
          .getValue();

        const activityBody = snapshot
          .getLoadable(activityBodyFamilyState({ activityId }))
          .getValue();

        if (isUpsertingActivityInDB || !activityFromStore) {
          return;
        }

        if (isActivityInCreateMode && isDefined(activity)) {
          if (canCreateActivity) {
            upsertActivity({
              activity,
              input: {
                title: activityFromStore.title,
                body: activityFromStore.body,
              },
            });
          } else {
            deleteRecordFromCache(activity);
          }

          set(isActivityInCreateModeState, false);
        } else if (isDefined(activity)) {
          if (
            activity.title !== activityTitle ||
            activity.body !== activityBody
          ) {
            upsertActivity({
              activity,
              input: {
                title: activityTitle,
                body: activityBody,
              },
            });
          }
        }
      },
    [activityId, deleteRecordFromCache, upsertActivity],
  );

  useRegisterClickOutsideListenerCallback({
    callbackId: 'activity-editor',
    callbackFunction: upsertActivityCallback,
  });

  return <></>;
};
