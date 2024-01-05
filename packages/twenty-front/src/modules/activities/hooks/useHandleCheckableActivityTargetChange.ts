import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';

export const useHandleCheckableActivityTargetChange = ({
  activityId,
  currentActivityTargets,
}: {
  activityId: string;
  currentActivityTargets: any[];
}) => {
  const { createOneRecord: createOneActivityTarget } =
    useCreateOneRecord<ActivityTarget>({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });
  const { deleteOneRecord: deleteOneActivityTarget } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.ActivityTarget,
  });

  return async (
    entityValues: Record<string, boolean>,
    entitiesToSelect: any,
    selectedEntities: any,
  ) => {
    if (!activityId) {
      return;
    }
    const currentActivityTargetRecordIds = currentActivityTargets.map(
      ({ companyId, personId }) => companyId ?? personId ?? '',
    );

    const idsToAdd = Object.entries(entityValues)
      .filter(
        ([recordId, value]) =>
          value && !currentActivityTargetRecordIds.includes(recordId),
      )
      .map(([id, _]) => id);

    const idsToDelete = Object.entries(entityValues)
      .filter(([_, value]) => !value)
      .map(([id, _]) => id);

    if (idsToAdd.length) {
      idsToAdd.forEach((id) => {
        const entityFromToSelect = entitiesToSelect.filter(
          (entity: any) => entity.id === id,
        ).length
          ? entitiesToSelect.filter((entity: any) => entity.id === id)[0]
          : null;

        const entityFromSelected = selectedEntities.filter(
          (entity: any) => entity.id === id,
        ).length
          ? selectedEntities.filter((entity: any) => entity.id === id)[0]
          : null;

        const entity = entityFromToSelect ?? entityFromSelected;
        createOneActivityTarget?.({
          activityId: activityId,
          companyId: entity.record.__typename === 'Company' ? entity.id : null,
          personId: entity.record.__typename === 'Person' ? entity.id : null,
        });
      });
    }

    if (idsToDelete.length) {
      idsToDelete.forEach((id) => {
        const currentActivityTargetId = currentActivityTargets.filter(
          ({ companyId, personId }) => companyId === id || personId === id,
        )[0].id;
        deleteOneActivityTarget?.(currentActivityTargetId);
      });
    }
  };
};
