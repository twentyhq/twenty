import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useQuery } from '@apollo/client/react';
import { GetCoreWorkflowVersionsDocument } from '~/generated/graphql';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type WorkflowVersion } from '@/workflow/types/Workflow';

type UseActiveWorkflowVersionProps = {
  workflowId: string;
};

export const useActiveWorkflowVersion = ({
  workflowId,
}: UseActiveWorkflowVersionProps) => {
  const isCore = useIsWorkflowCoreEnabled();
  const client = useApolloCoreClient();
  const core = useQuery(GetCoreWorkflowVersionsDocument, {
    client,
    variables: { coreWorkflowId: workflowId },
    skip: !isCore || !workflowId,
  });
  const { records: workflowVersions, loading } = useFindManyRecords<
    Pick<WorkflowVersion, 'id' | '__typename'>
  >({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    filter: {
      workflowId: {
        eq: workflowId,
      },
      status: {
        eq: 'ACTIVE',
      },
    },
    skip: isCore,
    recordGqlFields: {
      id: true,
    },
  });

  if (isCore) {
    return {
      workflowVersion: core.data?.coreWorkflowVersions.find(
        (version) => version.status === 'ACTIVE',
      ),
      loading: core.loading,
    };
  }

  return {
    workflowVersion: workflowVersions?.[0],
    loading,
  };
};
