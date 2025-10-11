import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type WorkflowVersion } from '@/workflow/types/Workflow';

type UseActiveWorkflowVersionProps = {
  workflowId: string;
};

export const useActiveWorkflowVersion = ({
  workflowId,
}: UseActiveWorkflowVersionProps) => {
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
    recordGqlFields: {
      id: true,
    },
  });

  return {
    workflowVersion: workflowVersions?.[0],
    loading,
  };
};
