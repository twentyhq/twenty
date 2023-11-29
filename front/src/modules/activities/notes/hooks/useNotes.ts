import { Note } from '@/activities/types/Note';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

import { ActivityTargetableEntity } from '../../types/ActivityTargetableEntity';

export const useNotes = (entity: ActivityTargetableEntity) => {
  const { records: activityTargets } = useFindManyRecords({
    objectNamePlural: 'activityTargets',
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
  };

  const { records: notes } = useFindManyRecords({
    skip: !activityTargets?.length,
    objectNamePlural: 'activities',
    filter,
    orderBy,
  });

  return {
    notes: notes as Note[],
  };
};
