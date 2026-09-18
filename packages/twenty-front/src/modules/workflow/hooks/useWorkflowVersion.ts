import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  GetCoreWorkflowVersionDocument,
  GetCoreWorkflowDocument,
} from '~/generated/graphql';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';
import { buildWorkflowVersionFromCore } from '@/object-core/workflows/utils/buildWorkflowVersionFromCore';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type Workflow, type WorkflowVersion } from '@/workflow/types/Workflow';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const useWorkflowVersion = (workflowVersionId?: string) => {
  const isCore = useIsWorkflowCoreEnabled();
  const client = useApolloCoreClient();
  const { data } = useQuery(GetCoreWorkflowVersionDocument, {
    client,
    variables: { coreWorkflowVersionId: workflowVersionId ?? '' },
    fetchPolicy: 'cache-and-network',
    skip: !isCore || !workflowVersionId,
  });
  const coreWorkflowId = data?.coreWorkflowVersion?.coreWorkflowId;
  const { data: workflowData } = useQuery(GetCoreWorkflowDocument, {
    client,
    variables: { coreWorkflowId: coreWorkflowId ?? '' },
    fetchPolicy: 'cache-and-network',
    skip: !isCore || !coreWorkflowId,
  });
  const coreVersion = useMemo(() => {
    const version = buildWorkflowVersionFromCore(data?.coreWorkflowVersion);
    return version
      ? {
          ...version,
          workflow: {
            id: version.workflowId,
            name: workflowData?.coreWorkflow?.name ?? '',
          },
        }
      : undefined;
  }, [data, workflowData]);
  const { record: workflowVersion } = useFindOneRecord<
    WorkflowVersion & { workflow: Pick<Workflow, 'id' | 'name'> }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    objectRecordId: workflowVersionId,
    recordGqlFields: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      workflowId: true,
      status: true,
      workflow: {
        id: true,
        name: true,
      },
    },
    skip: isCore || !workflowVersionId,
  });

  return isCore ? coreVersion : workflowVersion;
};
