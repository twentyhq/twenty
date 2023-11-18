import { Note } from '@/activities/types/Note';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';

import { ActivityTargetableEntity } from '../../types/ActivityTargetableEntity';

export const useNotes = (entity: ActivityTargetableEntity) => {
  const { objects: notes } = useFindManyObjectRecords({
    objectNamePlural: 'activities',
    filter: {
      type: { equals: 'None' },
      activityTargets: {
        some: {
          OR: [
            { companyId: { equals: entity.id } },
            { personId: { equals: entity.id } },
          ],
        },
      },
    },
  });

  return {
    notes: notes as Note[],
  };
};
