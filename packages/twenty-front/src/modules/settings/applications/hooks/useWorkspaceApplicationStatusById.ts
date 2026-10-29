import { getWorkspaceApplicationStatusById } from '@/settings/applications/utils/getWorkspaceApplicationStatusById';
import { useQuery } from '@apollo/client/react';
import { FindManyApplicationsForStatusDocument } from '~/generated-metadata/graphql';

type UseWorkspaceApplicationStatusByIdArgs = {
  applications: Parameters<
    typeof getWorkspaceApplicationStatusById
  >[0]['applications'];
  shouldSkip: boolean;
};

export const useWorkspaceApplicationStatusById = ({
  applications,
  shouldSkip,
}: UseWorkspaceApplicationStatusByIdArgs) => {
  const { data, error, refetch } = useQuery(
    FindManyApplicationsForStatusDocument,
    {
      skip: shouldSkip,
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    statusById: getWorkspaceApplicationStatusById({
      applications,
      applicationsWithVariables: data?.findManyApplications,
    }),
    error,
    refetch,
  };
};
