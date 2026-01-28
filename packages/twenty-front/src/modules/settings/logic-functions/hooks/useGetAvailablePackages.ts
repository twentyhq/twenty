import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useQuery } from '@apollo/client';
import { FIND_MANY_AVAILABLE_PACKAGES } from '@/settings/logic-functions/graphql/queries/findManyAvailablePackages';
import {
  type FindManyAvailablePackagesQuery,
  type FindManyAvailablePackagesQueryVariables,
  type LogicFunctionIdInput,
} from '~/generated-metadata/graphql';

export const useGetAvailablePackages = (input: LogicFunctionIdInput) => {
  const apolloMetadataClient = useApolloCoreClient();
  const { data } = useQuery<
    FindManyAvailablePackagesQuery,
    FindManyAvailablePackagesQueryVariables
  >(FIND_MANY_AVAILABLE_PACKAGES, {
    client: apolloMetadataClient ?? undefined,
    variables: {
      input,
    },
  });
  return {
    availablePackages: data?.getAvailablePackages || null,
  };
};
