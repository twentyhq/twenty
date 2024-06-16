import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { sortByAscString } from '~/utils/array/sortByAscString';

// Todo: this should be replace by the operationSignatureFactory pattern
export const makeTimelineActivitiesQueryVariables = ({
  activityIds,
}: {
  activityIds: string[];
}): RecordGqlOperationVariables => {
  return {
    filter: {
      id: {
        in: [...activityIds].sort(sortByAscString),
      },
    },
    orderBy: [
      {
        createdAt: 'DescNullsFirst',
      },
    ],
  };
};
