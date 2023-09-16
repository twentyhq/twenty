import { getOperationName } from '@apollo/client/utilities';
import { v4 } from 'uuid';

import { GET_COMPANIES } from '@/companies/graphql/queries/getCompanies';
import { GET_PEOPLE } from '@/people/graphql/queries/getPeople';
import {
  Activity,
  ActivityTarget,
  useAddActivityTargetsOnActivityMutation,
  useRemoveActivityTargetsOnActivityMutation,
} from '~/generated/graphql';

import { GET_ACTIVITY } from '../graphql/queries/getActivity';
import { ActivityTargetableEntityType } from '../types/ActivityTargetableEntity';
import { ActivityTargetableEntityForSelect } from '../types/ActivityTargetableEntityForSelect';

export const useHandleCheckableActivityTargetChange = ({
  activity,
}: {
  activity?: Pick<Activity, 'id'> & {
    activityTargets?: Array<
      Pick<ActivityTarget, 'id' | 'personId' | 'companyId'>
    > | null;
  };
}) => {
  const [addActivityTargetsOnActivity] =
    useAddActivityTargetsOnActivityMutation({
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_ACTIVITY) ?? '',
      ],
    });

  const [removeActivityTargetsOnActivity] =
    useRemoveActivityTargetsOnActivityMutation({
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_ACTIVITY) ?? '',
      ],
    });

  return async (
    entityValues: Record<string, boolean>,
    entities: ActivityTargetableEntityForSelect[],
  ) => {
    if (!activity) {
      return;
    }

    const currentEntityIds = activity.activityTargets
      ? activity.activityTargets.map(
          ({ personId, companyId }) => personId ?? companyId,
        )
      : [];

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
            companyId:
              entity.entityType === ActivityTargetableEntityType.Company
                ? entity.id
                : null,
            personId:
              entity.entityType === ActivityTargetableEntityType.Person
                ? entity.id
                : null,
          })),
        },
      });

    const activityTargetIdsToDelete = activity.activityTargets
      ? activity.activityTargets
          .filter(
            ({ personId, companyId }) =>
              (personId ?? companyId) &&
              !entityValues[personId ?? companyId ?? ''],
          )
          .map(({ id }) => id)
      : [];

    if (activityTargetIdsToDelete.length)
      await removeActivityTargetsOnActivity({
        variables: {
          activityId: activity.id,
          activityTargetIds: activityTargetIdsToDelete,
        },
      });
  };
};
