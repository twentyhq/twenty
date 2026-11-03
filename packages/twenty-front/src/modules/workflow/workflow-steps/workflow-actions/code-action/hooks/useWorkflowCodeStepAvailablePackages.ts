import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { WorkflowCodeStepAvailablePackagesDocument } from '~/generated/graphql';

export const useWorkflowCodeStepAvailablePackages = (
  workflowVersionId: string | undefined,
) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, previousData, loading } = useQuery(
    WorkflowCodeStepAvailablePackagesDocument,
    {
      client: apolloCoreClient,
      variables: { workflowVersionId: workflowVersionId ?? '' },
      skip: !isDefined(workflowVersionId),
    },
  );

  return {
    availablePackages:
      (data ?? previousData)?.workflowCodeStepAvailablePackages ?? null,
    // First load only: a draft created mid-edit changes the version and must not remount the editor
    isAvailablePackagesInitialLoading: loading && !isDefined(previousData),
  };
};
