import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FIND_MANY_LOGIC_FUNCTIONS } from '@/settings/logic-functions/graphql/queries/findManyLogicFunctions';
import { useQuery } from '@apollo/client';
import {
  type GetManyLogicFunctionsQuery,
  type GetManyLogicFunctionsQueryVariables,
} from '~/generated-metadata/graphql';

export const useGetManyLogicFunctions = () => {
  const apolloMetadataClient = useApolloCoreClient();

  const { data, loading, error } = useQuery<
    GetManyLogicFunctionsQuery,
    GetManyLogicFunctionsQueryVariables
  >(FIND_MANY_LOGIC_FUNCTIONS, {
    client: apolloMetadataClient ?? undefined,
  });

  return {
    logicFunctions: data?.findManyLogicFunctions || [],
    loading,
    error,
  };
};
