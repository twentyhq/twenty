import styled from '@emotion/styled';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';
import { IconTrash } from 'twenty-ui';

import { useRefreshShowPageFindManyActivitiesQueries } from '@/activities/hooks/useRefreshShowPageFindManyActivitiesQueries';
import { activityIdInDrawerState } from '@/activities/states/activityIdInDrawerState';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { temporaryActivityForEditorState } from '@/activities/states/temporaryActivityForEditorState';
import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteRecordFromCache } from '@/object-record/cache/hooks/useDeleteRecordFromCache';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { mapToRecordId } from '@/object-record/utils/mapToObjectId';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';
import { isDefined } from '~/utils/isDefined';

const StyledButtonContainer = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const ActivityActionBar = () => {
  const viewableRecordId = useRecoilValue(viewableRecordIdState);
  const activityIdInDrawer = useRecoilValue(activityIdInDrawerState);

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

  const { refreshShowPageFindManyActivitiesQueries } =
    useRefreshShowPageFindManyActivitiesQueries();

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

        setIsRightDrawerOpen(false);

        if (!isNonEmptyString(viewableRecordId)) {
          return;
        }

        if (isActivityInCreateMode && isDefined(temporaryActivityForEditor)) {
          deleteActivityFromCache(temporaryActivityForEditor);
          setTemporaryActivityForEditor(null);
          return;
        }

        if (isNonEmptyString(activityIdInDrawer)) {
          const activityTargetIdsToDelete: string[] =
            activity.activityTargets.map(mapToRecordId) ?? [];

          deleteActivityFromCache(activity);
          activity.activityTargets.forEach((activityTarget: ActivityTarget) => {
            deleteActivityTargetFromCache(activityTarget);
          });

          refreshShowPageFindManyActivitiesQueries();

          if (isNonEmptyArray(activityTargetIdsToDelete)) {
            await deleteManyActivityTargets(activityTargetIdsToDelete);
          }

          await deleteOneActivity?.(viewableRecordId);
        }
      },
    [
      activityIdInDrawer,
      setIsRightDrawerOpen,
      viewableRecordId,
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

  const actionsAreDisabled = isUpsertingActivityInDB;

  return (
    <StyledButtonContainer>
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
