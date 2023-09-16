import { ActivityType, useGetActivitiesQuery } from '~/generated/graphql';

import { ActivityTargetableEntity } from '../../types/ActivityTargetableEntity';

export const useNotes = (entity: ActivityTargetableEntity) => {
  const { data: notesData } = useGetActivitiesQuery({
    variables: {
      where: {
        type: { equals: ActivityType.Note },
        activityTargets: {
          some: {
            OR: [
              { companyId: { equals: entity.id } },
              { personId: { equals: entity.id } },
            ],
          },
        },
      },
    },
  });

  const notes = notesData?.findManyActivities;

  return {
    notes,
  };
};
