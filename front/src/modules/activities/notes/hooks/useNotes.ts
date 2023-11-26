import { Note } from '@/activities/types/Note';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';

import { ActivityTargetableEntity } from '../../types/ActivityTargetableEntity';

export const useNotes = (entity: ActivityTargetableEntity) => {
  const { objects: activityTargets } = useFindManyObjectRecords({
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

  const { objects: notes } = useFindManyObjectRecords({
    skip: !activityTargets?.length,
    objectNamePlural: 'activities',
    filter,
    orderBy,
  });

  return {
    notes: notes as Note[],
  };
};
