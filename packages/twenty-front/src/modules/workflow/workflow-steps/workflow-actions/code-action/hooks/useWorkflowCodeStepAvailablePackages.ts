import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { WorkflowCodeStepAvailablePackagesDocument } from '~/generated/graphql';

export const useWorkflowCodeStepAvailablePackages = (
  workflowVersionId: string | undefined,
) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data } = useQuery(WorkflowCodeStepAvailablePackagesDocument, {
    client: apolloCoreClient,
    variables: { workflowVersionId: workflowVersionId ?? '' },
    skip: !isDefined(workflowVersionId),
  });

  return {
    availablePackages: data?.workflowCodeStepAvailablePackages ?? null,
  };
};
