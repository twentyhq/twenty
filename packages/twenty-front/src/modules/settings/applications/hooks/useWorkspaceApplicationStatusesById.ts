import { getWorkspaceApplicationStatusesById } from '@/settings/applications/utils/getWorkspaceApplicationStatusesById';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
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
  const { data, loading, error, refetch } = useQuery(
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
    isLoading: loading && !isDefined(data),
    error,
    refetch,
  };
};
