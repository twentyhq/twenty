import { useRecoilCallback } from 'recoil';

import { useDeleteActivityFromCache } from '@/activities/hooks/useDeleteActivityFromCache';
import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { activityBodyFamilyState } from '@/activities/states/activityBodyFamilyState';
import { activityTitleFamilyState } from '@/activities/states/activityTitleFamilyState';
import { canCreateActivityState } from '@/activities/states/canCreateActivityState';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { Activity } from '@/activities/types/Activity';
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
  const { deleteActivityFromCache } = useDeleteActivityFromCache();

  const upsertActivityCallback = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const isUpsertingActivityInDB = snapshot
          .getLoadable(isUpsertingActivityInDBState())
          .getValue();

        const canCreateActivity = snapshot
          .getLoadable(canCreateActivityState())
          .getValue();

        const isActivityInCreateMode = snapshot
          .getLoadable(isActivityInCreateModeState())
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
            deleteActivityFromCache(activity);
          }

          set(isActivityInCreateModeState(), false);
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
    [activityId, deleteActivityFromCache, upsertActivity],
  );

  useRegisterClickOutsideListenerCallback({
    callbackId: 'activity-editor',
    callbackFunction: upsertActivityCallback,
  });

  return <></>;
};
