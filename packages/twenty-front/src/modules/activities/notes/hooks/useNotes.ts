import { useActivityTargetsForTargetableObject } from '@/activities/hooks/useActivityTargetsForTargetableObject';
import { Note } from '@/activities/types/Note';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { OrderByField } from '@/object-metadata/types/OrderByField';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

import { ActivityTargetableObject } from '../../types/ActivityTargetableEntity';

export const useNotes = (targetableObject: ActivityTargetableObject) => {
  const { activityTargets } = useActivityTargetsForTargetableObject({
    targetableObject,
  });

  const filter = {
    id: {
      in: activityTargets?.map((activityTarget) => activityTarget.activityId),
    },
    type: { eq: 'Note' },
  };

  const orderBy = {
    createdAt: 'AscNullsFirst',
  } as OrderByField;

  const { records: notes } = useFindManyRecords({
    skip: !activityTargets?.length,
    objectNameSingular: CoreObjectNameSingular.Activity,
    filter,
    orderBy,
  });

  return {
    notes: notes as Note[],
  };
};
