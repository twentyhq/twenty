import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ApplicationConnectionProvidersDocument } from '~/generated-metadata/graphql';

export const useWorkspaceCustomApplicationConnectionProviders = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const applicationId = currentWorkspace?.workspaceCustomApplication?.id;

  const { data, loading, error } = useQuery(
    ApplicationConnectionProvidersDocument,
    {
      skip: !isDefined(applicationId),
      variables: { applicationId: applicationId ?? '' },
    },
  );

  return {
    connectionProviders: data?.applicationConnectionProviders ?? [],
    loading,
    error,
  };
};
