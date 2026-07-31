import { useQuery } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { GET_PERSON_DUPLICATE_GROUPS } from '@/person-duplicate-review/graphql/personDuplicateReview';
import { type PersonDuplicateGroupsData } from '@/person-duplicate-review/types/PersonDuplicateReview';

export const usePersonDuplicateGroups = () => {
  const apolloCoreClient = useApolloCoreClient();
  const queryResult = useQuery<PersonDuplicateGroupsData>(
    GET_PERSON_DUPLICATE_GROUPS,
    {
      client: apolloCoreClient,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );

  return {
    ...queryResult,
    groups: queryResult.data?.personDuplicateGroups.groups ?? [],
    totalCount: queryResult.data?.personDuplicateGroups.totalCount ?? 0,
    canResolve: queryResult.data?.personDuplicateGroups.canResolve === true,
  };
};
