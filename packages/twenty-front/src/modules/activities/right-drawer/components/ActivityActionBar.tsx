import { useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { useDeleteActivityFromCache } from '@/activities/hooks/useDeleteActivityFromCache';
import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { useRemoveFromActivitiesQueries } from '@/activities/hooks/useRemoveFromActivitiesQueries';
import { useRemoveFromActivityTargetsQueries } from '@/activities/hooks/useRemoveFromActivityTargetsQueries';
import { currentNotesQueryVariablesState } from '@/activities/notes/states/currentNotesQueryVariablesState';
import { activityIdInDrawerState } from '@/activities/states/activityIdInDrawerState';
import { activityTargetableEntityArrayState } from '@/activities/states/activityTargetableEntityArrayState';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { temporaryActivityForEditorState } from '@/activities/states/temporaryActivityForEditorState';
import { viewableActivityIdState } from '@/activities/states/viewableActivityIdState';
import { currentCompletedTaskQueryVariablesState } from '@/activities/tasks/states/currentCompletedTaskQueryVariablesState';
import { currentIncompleteTaskQueryVariablesState } from '@/activities/tasks/states/currentIncompleteTaskQueryVariablesState';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timeline/constants/FindManyTimelineActivitiesOrderBy';
import { objectShowPageTargetableObjectState } from '@/activities/timeline/states/objectShowPageTargetableObjectIdState';
import { Activity } from '@/activities/types/Activity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { getChildRelationArray } from '@/object-record/utils/getChildRelationArray';
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

  const { deleteActivityFromCache } = useDeleteActivityFromCache();

  const [isActivityInCreateMode] = useRecoilState(isActivityInCreateModeState);
  const [isUpsertingActivityInDB] = useRecoilState(
    isUpsertingActivityInDBState,
  );

  const objectShowPageTargetableObject = useRecoilValue(
    objectShowPageTargetableObjectState,
  );

  const openCreateActivity = useOpenCreateActivityDrawer();

  const currentCompletedTaskQueryVariables = useRecoilValue(
    currentCompletedTaskQueryVariablesState,
  );

  const currentIncompleteTaskQueryVariables = useRecoilValue(
    currentIncompleteTaskQueryVariablesState,
  );

  const currentNotesQueryVariables = useRecoilValue(
    currentNotesQueryVariablesState,
  );

  const { pathname } = useLocation();
  const { removeFromActivitiesQueries } = useRemoveFromActivitiesQueries();
  const { removeFromActivityTargetsQueries } =
    useRemoveFromActivityTargetsQueries();

  const weAreOnObjectShowPage = pathname.startsWith('/object');
  const weAreOnTaskPage = pathname.startsWith('/tasks');

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

        if (viewableActivityId) {
          if (isActivityInCreateMode && isDefined(temporaryActivityForEditor)) {
            deleteActivityFromCache(temporaryActivityForEditor);
            setTemporaryActivityForEditor(null);
          } else {
            if (activityIdInDrawer) {
              const activityTargetIdsToDelete: string[] =
                activityTargets.map(mapToRecordId) ?? [];

              if (weAreOnTaskPage) {
                removeFromActivitiesQueries({
                  activityIdToRemove: viewableActivityId,
                  targetableObjects: [],
                  activitiesFilters: currentCompletedTaskQueryVariables?.filter,
                  activitiesOrderByVariables:
                    currentCompletedTaskQueryVariables?.orderBy,
                });

                removeFromActivitiesQueries({
                  activityIdToRemove: viewableActivityId,
                  targetableObjects: [],
                  activitiesFilters:
                    currentIncompleteTaskQueryVariables?.filter,
                  activitiesOrderByVariables:
                    currentIncompleteTaskQueryVariables?.orderBy,
                });
              } else if (
                weAreOnObjectShowPage &&
                isDefined(objectShowPageTargetableObject)
              ) {
                removeFromActivitiesQueries({
                  activityIdToRemove: viewableActivityId,
                  targetableObjects: [objectShowPageTargetableObject],
                  activitiesFilters: {},
                  activitiesOrderByVariables:
                    FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
                });

                if (isDefined(currentCompletedTaskQueryVariables)) {
                  removeFromActivitiesQueries({
                    activityIdToRemove: viewableActivityId,
                    targetableObjects: [objectShowPageTargetableObject],
                    activitiesFilters:
                      currentCompletedTaskQueryVariables?.filter,
                    activitiesOrderByVariables:
                      currentCompletedTaskQueryVariables?.orderBy,
                  });
                }

                if (isDefined(currentIncompleteTaskQueryVariables)) {
                  removeFromActivitiesQueries({
                    activityIdToRemove: viewableActivityId,
                    targetableObjects: [objectShowPageTargetableObject],
                    activitiesFilters:
                      currentIncompleteTaskQueryVariables?.filter,
                    activitiesOrderByVariables:
                      currentIncompleteTaskQueryVariables?.orderBy,
                  });
                }

                if (isDefined(currentNotesQueryVariables)) {
                  removeFromActivitiesQueries({
                    activityIdToRemove: viewableActivityId,
                    targetableObjects: [objectShowPageTargetableObject],
                    activitiesFilters: currentNotesQueryVariables?.filter,
                    activitiesOrderByVariables:
                      currentNotesQueryVariables?.orderBy,
                  });
                }

                removeFromActivityTargetsQueries({
                  activityTargetsToRemove: activity?.activityTargets ?? [],
                  targetableObjects: [objectShowPageTargetableObject],
                });
              }

              if (isNonEmptyArray(activityTargetIdsToDelete)) {
                await deleteManyActivityTargets(activityTargetIdsToDelete);
              }

              await deleteOneActivity?.(viewableActivityId);
            }
          }
        }
      },
    [
      activityIdInDrawer,
      currentCompletedTaskQueryVariables,
      currentIncompleteTaskQueryVariables,
      currentNotesQueryVariables,
      deleteActivityFromCache,
      deleteManyActivityTargets,
      deleteOneActivity,
      isActivityInCreateMode,
      objectShowPageTargetableObject,
      removeFromActivitiesQueries,
      removeFromActivityTargetsQueries,
      setTemporaryActivityForEditor,
      temporaryActivityForEditor,
      viewableActivityId,
      weAreOnObjectShowPage,
      weAreOnTaskPage,
      setIsRightDrawerOpen,
    ],
  );

  const record = useRecoilValue(
    recordStoreFamilyState(viewableActivityId ?? ''),
  );

  const addActivity = () => {
    setIsRightDrawerOpen(false);
    if (record && objectShowPageTargetableObject) {
      openCreateActivity({
        type: record.type,
        customAssignee: record.assignee,
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
