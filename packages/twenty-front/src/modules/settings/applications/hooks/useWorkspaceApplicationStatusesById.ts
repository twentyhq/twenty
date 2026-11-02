import { getWorkspaceApplicationStatusesById } from '@/settings/applications/utils/getWorkspaceApplicationStatusesById';
import { useQuery } from '@apollo/client/react';
import { FindManyApplicationsForStatusDocument } from '~/generated-metadata/graphql';

type UseWorkspaceApplicationStatusesByIdArgs = {
  applications: Parameters<
    typeof getWorkspaceApplicationStatusesById
  >[0]['applications'];
  shouldSkip: boolean;
};

export const useWorkspaceApplicationStatusesById = ({
  applications,
  shouldSkip,
}: UseWorkspaceApplicationStatusesByIdArgs) => {
  const { data, error, refetch } = useQuery(
    FindManyApplicationsForStatusDocument,
    {
      skip: shouldSkip,
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    statusesById: getWorkspaceApplicationStatusesById({
      applications,
      applicationsWithVariables: data?.findManyApplications,
    }),
    error,
    refetch,
  };
};
