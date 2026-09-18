import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

type CoreWorkflowsWithCurrentVersionsLoaderProps = {
  children: (workflows: WorkflowWithCurrentVersion[]) => React.ReactNode;
  workflowIds: string[];
};

type CoreWorkflowWithCurrentVersionLoaderProps =
  CoreWorkflowsWithCurrentVersionsLoaderProps & {
    loadedWorkflows: WorkflowWithCurrentVersion[];
    workflowIndex: number;
  };

const CoreWorkflowWithCurrentVersionLoader = ({
  children,
  loadedWorkflows,
  workflowIds,
  workflowIndex,
}: CoreWorkflowWithCurrentVersionLoaderProps) => {
  const workflow = useWorkflowWithCurrentVersion(workflowIds[workflowIndex]);
  const nextLoadedWorkflows = isDefined(workflow)
    ? [...loadedWorkflows, workflow]
    : loadedWorkflows;
  const nextWorkflowIndex = workflowIndex + 1;

  if (nextWorkflowIndex >= workflowIds.length) {
    return children(nextLoadedWorkflows);
  }

  return (
    <CoreWorkflowWithCurrentVersionLoader
      workflowIds={workflowIds}
      workflowIndex={nextWorkflowIndex}
      loadedWorkflows={nextLoadedWorkflows}
    >
      {children}
    </CoreWorkflowWithCurrentVersionLoader>
  );
};

export const CoreWorkflowsWithCurrentVersionsLoader = ({
  children,
  workflowIds,
}: CoreWorkflowsWithCurrentVersionsLoaderProps) => {
  if (workflowIds.length === 0) {
    return children([]);
  }

  return (
    <CoreWorkflowWithCurrentVersionLoader
      workflowIds={workflowIds}
      workflowIndex={0}
      loadedWorkflows={[]}
    >
      {children}
    </CoreWorkflowWithCurrentVersionLoader>
  );
};
