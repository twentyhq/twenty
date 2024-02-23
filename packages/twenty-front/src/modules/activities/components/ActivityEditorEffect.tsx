import { useRecoilState } from 'recoil';

import { useDeleteActivityFromCache } from '@/activities/hooks/useDeleteActivityFromCache';
import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { canCreateActivityState } from '@/activities/states/canCreateActivityState';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { Activity } from '@/activities/types/Activity';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID } from '@/ui/layout/right-drawer/constants/RightDrawerClickOutsideListener';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';

export const ActivityEditorEffect = ({
  activityId,
}: {
  activityId: string;
}) => {
  console.log('ActivityEditorEffect');
  const [activityFromStore] = useRecoilState(
    recordStoreFamilyState(activityId),
  );

  const activity = activityFromStore as Activity;

  const [isActivityInCreateMode, setIsActivityInCreateMode] = useRecoilState(
    isActivityInCreateModeState,
  );

  const [isUpsertingActivityInDB] = useRecoilState(
    isUpsertingActivityInDBState,
  );

  const [canCreateActivity] = useRecoilState(canCreateActivityState);

  const { useRegisterClickOutsideListenerCallback } = useClickOutsideListener(
    RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID,
  );

  const { upsertActivity } = useUpsertActivity();
  const { deleteActivityFromCache } = useDeleteActivityFromCache();

  useRegisterClickOutsideListenerCallback({
    callbackId: 'activity-editor',
    callbackFunction: () => {
      if (isUpsertingActivityInDB || !activityFromStore) {
        return;
      }

      if (isActivityInCreateMode) {
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

        setIsActivityInCreateMode(false);
      } else {
        if (
          activityFromStore.title !== activity.title ||
          activityFromStore.body !== activity.body
        ) {
          upsertActivity({
            activity,
            input: {
              title: activityFromStore.title,
              body: activityFromStore.body,
            },
          });
        }
      }
    },
  });

  return <></>;
};
