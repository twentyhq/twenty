import { v4 } from 'uuid';

import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { useCreateOneObjectRecord } from '@/object-record/hooks/useCreateOneObjectRecord';
import { useDeleteOneObjectRecord } from '@/object-record/hooks/useDeleteOneObjectRecord';

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
  const { createOneObject } = useCreateOneObjectRecord<ActivityTarget>({
    objectNameSingular: 'activityTarget',
  });
  const { deleteOneObject } = useDeleteOneObjectRecord({
    objectNameSingular: 'activityTarget',
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

    if (entitiesToAdd.length) {
      entitiesToAdd.map((entity) => {
        createOneObject?.({
          activityId: activity.id,
          activityTargetInputs: {
            id: v4(),
            createdAt: new Date().toISOString(),
            companyId: entity.entityType === 'Company' ? entity.id : null,
            personId: entity.entityType === 'Person' ? entity.id : null,
          },
        });
      });
    }

    const activityTargetIdsToDelete = activity.activityTargets
      ? activity.activityTargets
          .filter(
            ({ personId, companyId }) =>
              (personId ?? companyId) &&
              !entityValues[personId ?? companyId ?? ''],
          )
          .map(({ id }) => id)
      : [];

    if (activityTargetIdsToDelete.length) {
      activityTargetIdsToDelete.map((id) => {
        deleteOneObject?.(id);
      });
    }
  };
};
