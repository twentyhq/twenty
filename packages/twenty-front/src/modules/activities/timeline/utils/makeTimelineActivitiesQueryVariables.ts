import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';
import { sortByAscString } from '~/utils/array/sortByAscString';

export const makeTimelineActivitiesQueryVariables = ({
  activityIds,
}: {
  activityIds: string[];
}): ObjectRecordQueryVariables => {
  return {
    filter: {
      id: {
        in: activityIds.toSorted(sortByAscString),
      },
    },
    orderBy: {
      createdAt: 'DescNullsFirst',
    },
  };
};
