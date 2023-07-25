import { getOperationName } from '@apollo/client/utilities';
import { v4 } from 'uuid';

import { GET_COMPANIES } from '@/companies/queries';
import { GET_PEOPLE } from '@/people/queries';
import {
  Activity,
  ActivityTarget,
  useAddActivityTargetsOnActivityMutation,
  useRemoveActivityTargetsOnActivityMutation,
} from '~/generated/graphql';

import { GET_ACTIVITIES_BY_TARGETS } from '../queries';
import { CommentableEntityForSelect } from '../types/CommentableEntityForSelect';

export function useHandleCheckableActivityTargetChange({
  activity,
}: {
  activity?: Pick<Activity, 'id'> & {
    activityTargets: Array<
      Pick<ActivityTarget, 'id' | 'personId' | 'companyId'>
    >;
  };
}) {
  const [addActivityTargetsOnActivity] =
    useAddActivityTargetsOnActivityMutation({
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_ACTIVITIES_BY_TARGETS) ?? '',
      ],
    });

  const [removeActivityTargetsOnActivity] =
    useRemoveActivityTargetsOnActivityMutation({
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_ACTIVITIES_BY_TARGETS) ?? '',
      ],
    });

  return async function handleCheckItemsChange(
    entityValues: Record<string, boolean>,
    entities: CommentableEntityForSelect[],
  ) {
    if (!activity) {
      return;
    }

    const currentEntityIds = activity.activityTargets.map(
      ({ personId }) => personId,
    );

    const entitiesToAdd = entities.filter(
      ({ id }) => entityValues[id] && !currentEntityIds.includes(id),
    );

    if (entitiesToAdd.length)
      await addActivityTargetsOnActivity({
        variables: {
          activityId: activity.id,
          activityTargetInputs: entitiesToAdd.map((entity) => ({
            id: v4(),
            createdAt: new Date().toISOString(),
            personId: entity.id,
          })),
        },
      });

    const activityTargetIdsToDelete = activity.activityTargets
      .filter(({ commentableId }) => !entityValues[commentableId])
      .map(({ id }) => id);

    if (activityTargetIdsToDelete.length)
      await removeActivityTargetsOnActivity({
        variables: {
          activityId: activity.id,
          activityTargetIds: activityTargetIdsToDelete,
        },
      });
  };
}
