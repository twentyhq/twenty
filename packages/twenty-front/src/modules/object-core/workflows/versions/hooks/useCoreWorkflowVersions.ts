import { useQuery } from '@apollo/client/react';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { GetCoreWorkflowVersionsDocument } from '~/generated/graphql';

export const useCoreWorkflowVersions = (workflowId: string) => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error, refetch } = useQuery(
    GetCoreWorkflowVersionsDocument,
    {
      client: apolloCoreClient,
      fetchPolicy: 'cache-and-network',
      variables: { workspaceWorkflowId: workflowId },
    },
  );

  const recordStore = useAtomFamilyStateValue(
    recordStoreFamilyState,
    workflowId,
  );

  const workspaceWorkflowVersions: Array<
    Pick<WorkflowVersion, 'id' | 'status'>
  > = recordStore?.versions ?? [];

  const workspaceVersionsSignature = workspaceWorkflowVersions
    .map((workflowVersion) => `${workflowVersion.id}:${workflowVersion.status}`)
    .sort()
    .join(',');

  const [lastWorkspaceVersionsSignature, setLastWorkspaceVersionsSignature] =
    useState<string | undefined>(undefined);

  useEffect(() => {
    if (
      workspaceVersionsSignature === '' ||
      lastWorkspaceVersionsSignature === workspaceVersionsSignature
    ) {
      return;
    }

    setLastWorkspaceVersionsSignature(workspaceVersionsSignature);

    if (isDefined(lastWorkspaceVersionsSignature)) {
      refetch();
    }
  }, [lastWorkspaceVersionsSignature, refetch, workspaceVersionsSignature]);

  return {
    coreWorkflowVersions: data?.coreWorkflowVersions ?? [],
    loading,
    error,
    refetchCoreWorkflowVersions: refetch,
  };
};
