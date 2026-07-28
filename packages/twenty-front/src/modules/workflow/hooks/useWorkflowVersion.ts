import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type Workflow, type WorkflowVersion } from '@/workflow/types/Workflow';
import { useSyncWorkflowVersionContentFromCore } from '@/workflow/workflow-version/hooks/useSyncWorkflowVersionContentFromCore';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const useWorkflowVersion = (workflowVersionId?: string) => {
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
      trigger: true,
      steps: true,
      status: true,
      workflow: {
        id: true,
        name: true,
      },
    },
    skip: !workflowVersionId,
  });

  // passing the loaded record id, not the requested one: the core content can
  // only be written into the record cache once the record itself is there
  useSyncWorkflowVersionContentFromCore(workflowVersion?.id);

  return workflowVersion;
};
