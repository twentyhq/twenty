import { getWorkspaceApplicationStatusById } from '@/settings/applications/utils/getWorkspaceApplicationStatusById';
import { useQuery } from '@apollo/client/react';
import { FindManyApplicationsForStatusDocument } from '~/generated-metadata/graphql';

type UseWorkspaceApplicationStatusByIdArgs = {
  applications: Parameters<
    typeof getWorkspaceApplicationStatusById
  >[0]['applications'];
  skip: boolean;
};

export const useWorkspaceApplicationStatusById = ({
  applications,
  skip,
}: UseWorkspaceApplicationStatusByIdArgs) => {
  const { data, error, refetch } = useQuery(
    FindManyApplicationsForStatusDocument,
    {
      skip,
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
