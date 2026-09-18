import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

type CoreWorkflowsWithCurrentVersionsLoaderProps = {
  children: (workflows: WorkflowWithCurrentVersion[]) => React.ReactNode;
  workflowIds: string[];
};

type CoreWorkflowWithCurrentVersionLoaderProps = {
  children: (
    workflow: WorkflowWithCurrentVersion | undefined,
  ) => React.ReactNode;
  workflowId: string;
};

const CoreWorkflowWithCurrentVersionLoader = ({
  children,
  workflowId,
}: CoreWorkflowWithCurrentVersionLoaderProps) => {
  return children(useWorkflowWithCurrentVersion(workflowId));
};

export const CoreWorkflowsWithCurrentVersionsLoader = ({
  children,
  workflowIds,
}: CoreWorkflowsWithCurrentVersionsLoaderProps) => {
  const renderLoadedWorkflows = workflowIds.reduceRight<
    (loadedWorkflows: WorkflowWithCurrentVersion[]) => React.ReactNode
  >(
    (renderNextWorkflow, workflowId) => (loadedWorkflows) => (
      <CoreWorkflowWithCurrentVersionLoader workflowId={workflowId}>
        {(workflow) =>
          renderNextWorkflow(
            isDefined(workflow)
              ? [...loadedWorkflows, workflow]
              : loadedWorkflows,
          )
        }
      </CoreWorkflowWithCurrentVersionLoader>
    ),
    children,
  );

  return renderLoadedWorkflows([]);
};
