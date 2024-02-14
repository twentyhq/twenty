import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useDeleteActivityFromCache } from '@/activities/hooks/useDeleteActivityFromCache';
import { useOpenCreateActivityDrawerV2 } from '@/activities/hooks/useOpenCreateActivityDrawerV2';
import { activityInDrawerState } from '@/activities/states/activityInDrawerState';
import { activityTargetableEntityArrayState } from '@/activities/states/activityTargetableEntityArrayState';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { temporaryActivityForEditorState } from '@/activities/states/temporaryActivityForEditorState';
import { viewableActivityIdState } from '@/activities/states/viewableActivityIdState';
import { useRemoveFromTimelineActivitiesQueries } from '@/activities/timeline/hooks/useRemoveFromTimelineActivitiesQueries';
import { timelineTargetableObjectState } from '@/activities/timeline/states/timelineTargetableObjectState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { mapToRecordId } from '@/object-record/utils/mapToObjectId';
import { IconPlus, IconTrash } from '@/ui/display/icon';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';
import { isDefined } from '~/utils/isDefined';

const StyledButtonContainer = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const ActivityActionBar = () => {
  const viewableActivityId = useRecoilValue(viewableActivityIdState);
  const activityInDrawer = useRecoilValue(activityInDrawerState);

  const activityTargetableEntityArray = useRecoilValue(
    activityTargetableEntityArrayState,
  );
  const [, setIsRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);
  const { deleteOneRecord: deleteOneActivity } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Activity,
    // refetchFindManyQuery: true,
  });

  const { deleteManyRecords: deleteManyActivityTargets } = useDeleteManyRecords(
    {
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
      // refetchFindManyQuery: true,
    },
  );

  const [temporaryActivityForEditor, setTemporaryActivityForEditor] =
    useRecoilState(temporaryActivityForEditorState);

  const { deleteActivityFromCache } = useDeleteActivityFromCache();

  const [isActivityInCreateMode] = useRecoilState(isActivityInCreateModeState);
  const [isUpsertingActivityInDB] = useRecoilState(
    isUpsertingActivityInDBState,
  );
  const timelineTargetableObject = useRecoilValue(
    timelineTargetableObjectState,
  );
  const openCreateActivity = useOpenCreateActivityDrawerV2();

  const { removeFromTimelineActivitiesQueries } =
    useRemoveFromTimelineActivitiesQueries();

  const deleteActivity = () => {
    if (viewableActivityId) {
      if (isActivityInCreateMode && isDefined(temporaryActivityForEditor)) {
        deleteActivityFromCache(temporaryActivityForEditor);
        setTemporaryActivityForEditor(null);
      } else {
        if (activityInDrawer) {
          const activityTargetIdsToDelete =
            activityInDrawer?.activityTargets.map(mapToRecordId) ?? [];

          removeFromTimelineActivitiesQueries({
            activityTargetsToRemove: activityInDrawer?.activityTargets ?? [],
            activityIdToRemove: viewableActivityId,
          });

          deleteManyActivityTargets(activityTargetIdsToDelete);
          deleteOneActivity?.(viewableActivityId);
        }

        // Call a hook to inject into activity timeline
        // TODO: find a better way to do this with custom optimistic rendering for activities
      }
    }

    setIsRightDrawerOpen(false);
  };

  const record = useRecoilValue(
    recordStoreFamilyState(viewableActivityId ?? ''),
  );

  const addActivity = () => {
    setIsRightDrawerOpen(false);
    if (record && timelineTargetableObject) {
      openCreateActivity({
        timelineTargetableObject,
        type: record.type,
        assigneeId: isNonEmptyString(record.assigneeId)
          ? record.assigneeId
          : undefined,
        targetableObjects: activityTargetableEntityArray,
      });
    }
  };

  const actionsAreDisabled = isUpsertingActivityInDB;

  return (
    <StyledButtonContainer>
      <IconButton
        Icon={IconPlus}
        onClick={addActivity}
        size="medium"
        variant="secondary"
        disabled={actionsAreDisabled}
      />
      <IconButton
        Icon={IconTrash}
        onClick={deleteActivity}
        size="medium"
        variant="secondary"
        disabled={actionsAreDisabled}
      />
    </StyledButtonContainer>
  );
};
