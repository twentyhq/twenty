import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/input';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useSidePanelWorkflowIdOrThrow } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowIdOrThrow';
import { type Workflow } from '@/workflow/types/Workflow';

export const useRunWorkflowActionWorkflowOptions = () => {
  const currentWorkflowId = useSidePanelWorkflowIdOrThrow();

  const { records: workflows, loading } = useFindManyRecords<Workflow>({
    objectNameSingular: CoreObjectNameSingular.Workflow,
    recordGqlFields: {
      id: true,
      name: true,
      lastPublishedVersionId: true,
    },
    orderBy: [{ name: 'AscNullsLast' }],
    // Workspaces can have more than the default page size of workflows;
    // this picker has no fetchMore/cursor pagination yet, so raise the
    // cap well above the default rather than silently hiding options.
    limit: 200,
  });

  const eligibleWorkflows = workflows.filter(
    (workflow) => workflow.id !== currentWorkflowId,
  );

  const workflowOptions: SelectOption<string>[] = eligibleWorkflows.map(
    (workflow) => ({
      label: workflow.name,
      value: workflow.id,
    }),
  );

  const getWorkflowHasNoActiveVersion = (workflowId: string): boolean => {
    const workflow = eligibleWorkflows.find(
      (eligibleWorkflow) => eligibleWorkflow.id === workflowId,
    );

    if (!isDefined(workflow)) {
      return false;
    }

    return !isDefined(workflow.lastPublishedVersionId);
  };

  return { workflowOptions, getWorkflowHasNoActiveVersion, loading };
};
