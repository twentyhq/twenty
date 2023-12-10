import { Note } from '@/activities/types/Note';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

import { ActivityTargetableEntity } from '../../types/ActivityTargetableEntity';

export const useNotes = (entity: ActivityTargetableEntity) => {
  const { records: activityTargets } = useFindManyRecords({
    objectNameSingular: 'activityTarget',
    filter: {
      [entity.type === 'Company' ? 'companyId' : 'personId']: { eq: entity.id },
    },
  });

  const filter = {
    id: {
      in: activityTargets?.map((activityTarget) => activityTarget.activityId),
    },
    type: { eq: 'Note' },
  };
  const orderBy = {
    createdAt: 'AscNullsFirst',
  } as any; // TODO: finish typing

  const { records: notes } = useFindManyRecords({
    skip: !activityTargets?.length,
    objectNameSingular: 'activity',
    filter,
    orderBy,
  });

  return {
    notes: notes as Note[],
  };
};
