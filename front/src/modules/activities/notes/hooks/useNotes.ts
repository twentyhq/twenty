import { Note } from '@/activities/types/Note';
import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getRecordOptimisticEffectDefinition } from '@/object-record/graphql/optimistic-effect-definition/getRecordOptimisticEffectDefinition';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';

import { ActivityTargetableEntity } from '../../types/ActivityTargetableEntity';

export const useNotes = (entity: ActivityTargetableEntity) => {
  const { objects: activityTargets } = useFindManyObjectRecords({
    objectNamePlural: 'activityTargets',
    filter: {
      [entity.type === 'Company' ? 'companyId' : 'personId']: { eq: entity.id },
    },
  });

  const { objectMetadataItem: activityObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: 'activity',
    });

  const { registerOptimisticEffect } = useOptimisticEffect({
    objectNameSingular: activityObjectMetadataItem?.nameSingular,
  });

  const filter = {
    id: {
      in: activityTargets?.map((activityTarget) => activityTarget.activityId),
    },
    type: { eq: 'Note' },
  };
  const orderBy = {
    createdAt: 'AscNullsFirst',
  };

  const { objects: notes } = useFindManyObjectRecords({
    skip: !activityTargets?.length,
    objectNamePlural: 'activities',
    filter,
    orderBy,
    onCompleted: () => {
      if (activityObjectMetadataItem) {
        registerOptimisticEffect({
          variables: { orderBy, filter },
          definition: getRecordOptimisticEffectDefinition({
            objectMetadataItem: activityObjectMetadataItem,
          }),
        });
      }
    },
  });

  return {
    notes: notes as Note[],
  };
};
