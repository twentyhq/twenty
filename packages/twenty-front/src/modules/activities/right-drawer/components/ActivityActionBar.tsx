import styled from '@emotion/styled';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';
import { IconPlus, IconTrash } from 'twenty-ui';

import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { useRefreshShowPageFindManyActivitiesQueries } from '@/activities/hooks/useRefreshShowPageFindManyActivitiesQueries';
import { activityIdInDrawerState } from '@/activities/states/activityIdInDrawerState';
import { activityTargetableEntityArrayState } from '@/activities/states/activityTargetableEntityArrayState';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { temporaryActivityForEditorState } from '@/activities/states/temporaryActivityForEditorState';
import { viewableActivityIdState } from '@/activities/states/viewableActivityIdState';
import { objectShowPageTargetableObjectState } from '@/activities/timeline/states/objectShowPageTargetableObjectIdState';
import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteRecordFromCache } from '@/object-record/cache/hooks/useDeleteRecordFromCache';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { getChildRelationArray } from '@/object-record/utils/getChildRelationArray';
import { mapToRecordId } from '@/object-record/utils/mapToObjectId';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';
import { isDefined } from '~/utils/isDefined';

const StyledButtonContainer = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const ActivityActionBar = () => {
  const viewableActivityId = useRecoilValue(viewableActivityIdState);
  const activityIdInDrawer = useRecoilValue(activityIdInDrawerState);

  const activityTargetableEntityArray = useRecoilValue(
    activityTargetableEntityArrayState,
  );
  const [, setIsRightDrawerOpen] = useRecoilState(isRightDrawerOpenState);
  const { deleteOneRecord: deleteOneActivity } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Activity,
  });

  const { deleteManyRecords: deleteManyActivityTargets } = useDeleteManyRecords(
    {
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    },
  );

  const [temporaryActivityForEditor, setTemporaryActivityForEditor] =
    useRecoilState(temporaryActivityForEditorState);

  const deleteActivityFromCache = useDeleteRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.Activity,
  });
  const deleteActivityTargetFromCache = useDeleteRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.ActivityTarget,
  });

  const [isActivityInCreateMode] = useRecoilState(isActivityInCreateModeState);
  const [isUpsertingActivityInDB] = useRecoilState(
    isUpsertingActivityInDBState,
  );

  const objectShowPageTargetableObject = useRecoilValue(
    objectShowPageTargetableObjectState,
  );

  const { refreshShowPageFindManyActivitiesQueries } =
    useRefreshShowPageFindManyActivitiesQueries();

  const openCreateActivity = useOpenCreateActivityDrawer();

  const deleteActivity = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        if (!activityIdInDrawer) {
          throw new Error(
            'activityIdInDrawer is not defined, this should not happen',
          );
        }

        const activity = snapshot
          .getLoadable(recordStoreFamilyState(activityIdInDrawer))
          .getValue() as Activity;

        const activityTargets = getChildRelationArray({
          childRelation: activity.activityTargets,
        });

        setIsRightDrawerOpen(false);

        if (!isNonEmptyString(viewableActivityId)) {
          return;
        }

        if (isActivityInCreateMode && isDefined(temporaryActivityForEditor)) {
          deleteActivityFromCache(temporaryActivityForEditor);
          setTemporaryActivityForEditor(null);
          return;
        }

        if (isNonEmptyString(activityIdInDrawer)) {
          const activityTargetIdsToDelete: string[] =
            activityTargets.map(mapToRecordId) ?? [];

          deleteActivityFromCache(activity);
          activityTargets.forEach((activityTarget: ActivityTarget) => {
            deleteActivityTargetFromCache(activityTarget);
          });

          refreshShowPageFindManyActivitiesQueries();

          if (isNonEmptyArray(activityTargetIdsToDelete)) {
            await deleteManyActivityTargets(activityTargetIdsToDelete);
          }

          await deleteOneActivity?.(viewableActivityId);
        }
      },
    [
      activityIdInDrawer,
      setIsRightDrawerOpen,
      viewableActivityId,
      isActivityInCreateMode,
      temporaryActivityForEditor,
      deleteActivityFromCache,
      setTemporaryActivityForEditor,
      refreshShowPageFindManyActivitiesQueries,
      deleteOneActivity,
      deleteActivityTargetFromCache,
      deleteManyActivityTargets,
    ],
  );

  const record = useRecoilValue(
    recordStoreFamilyState(viewableActivityId ?? ''),
  );

  const addActivity = () => {
    setIsRightDrawerOpen(false);
    if (isDefined(record) && isDefined(objectShowPageTargetableObject)) {
      openCreateActivity({
        type: record?.type,
        customAssignee: record?.assignee,
        targetableObjects: activityTargetableEntityArray,
      });
    }
  };

  const actionsAreDisabled = isUpsertingActivityInDB;

  const isCreateActionDisabled = isActivityInCreateMode;

  return (
    <StyledButtonContainer>
      <IconButton
        Icon={IconPlus}
        onClick={addActivity}
        size="medium"
        variant="secondary"
        disabled={actionsAreDisabled || isCreateActionDisabled}
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
