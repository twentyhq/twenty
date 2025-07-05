import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useQuery } from '@apollo/client';
import { FIND_MANY_AVAILABLE_PACKAGES } from '@/settings/serverless-functions/graphql/queries/findManyAvailablePackages';
import {
  FindManyAvailablePackagesQuery,
  FindManyAvailablePackagesQueryVariables,
  ServerlessFunctionIdInput,
} from '~/generated-metadata/graphql';

export const useGetAvailablePackages = (input: ServerlessFunctionIdInput) => {
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
