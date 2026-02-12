import { useQuery } from '@apollo/client';
import { FIND_MANY_AVAILABLE_PACKAGES } from '@/logic-functions/graphql/queries/findManyAvailablePackages';
import {
  type FindManyAvailablePackagesQuery,
  type FindManyAvailablePackagesQueryVariables,
  type LogicFunctionIdInput,
} from '~/generated-metadata/graphql';

export const useGetAvailablePackages = (input: LogicFunctionIdInput) => {
  const { data } = useQuery<
    FindManyAvailablePackagesQuery,
    FindManyAvailablePackagesQueryVariables
  >(FIND_MANY_AVAILABLE_PACKAGES, {
    variables: {
      input,
    },
  });
  return {
    availablePackages: data?.getAvailablePackages || null,
  };
};
