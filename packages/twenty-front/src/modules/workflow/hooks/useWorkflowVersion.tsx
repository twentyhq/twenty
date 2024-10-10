import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { Workflow, WorkflowVersion } from '@/workflow/types/Workflow';

export const useWorkflowVersion = (workflowVersionId: string) => {
  const { record: workflowVersion } = useFindOneRecord<
    WorkflowVersion & {
      workflow: Omit<Workflow, 'versions'> & {
        versions: Array<{ __typename: string }>;
      };
    }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    objectRecordId: workflowVersionId,
    recordGqlFields: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      workflowId: true,
      trigger: true,
      steps: true,
      status: true,
      workflow: {
        id: true,
        name: true,
        statuses: true,
        versions: {
          totalCount: true,
        },
      },
    },
  });

  return workflowVersion;
};
