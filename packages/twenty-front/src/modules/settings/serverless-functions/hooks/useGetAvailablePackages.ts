import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { useQuery } from '@apollo/client';
import { FIND_MANY_AVAILABLE_PACKAGES } from '@/settings/serverless-functions/graphql/queries/findManyAvailablePackages';
import {
  FindManyAvailablePackagesQuery,
  FindManyAvailablePackagesQueryVariables,
} from '~/generated-metadata/graphql';

export const useGetAvailablePackages = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const { data } = useQuery<
    FindManyAvailablePackagesQuery,
    FindManyAvailablePackagesQueryVariables
  >(FIND_MANY_AVAILABLE_PACKAGES, {
    client: apolloMetadataClient ?? undefined,
  });
  return {
    availablePackages: data?.getAvailablePackages || null,
  };
};
