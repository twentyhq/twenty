import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

export const makeTimelineActivitiesQueryVariables = ({
  activityIds,
}: {
  activityIds: string[];
}): ObjectRecordQueryVariables => {
  return {
    filter: {
      id: {
        in: activityIds,
      },
    },
    orderBy: {
      createdAt: 'DescNullsFirst',
    },
  };
};
