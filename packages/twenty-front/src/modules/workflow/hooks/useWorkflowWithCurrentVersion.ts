import { useCoreWorkflowForShowPage } from '@/object-core/workflows/hooks/useCoreWorkflowForShowPage';
import { useCoreWorkflowVersionContent } from '@/object-core/workflows/hooks/useCoreWorkflowVersionContent';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { getWorkflowCurrentVersion } from '@/workflow/utils/getWorkflowCurrentVersion';
import { isDefined } from 'twenty-shared/utils';

export const useWorkflowWithCurrentVersion = (
  workflowId: string | undefined,
): WorkflowWithCurrentVersion | undefined => {
  const { coreWorkflow, versions } = useCoreWorkflowForShowPage({
    coreWorkflowId: workflowId,
  });

  const workflowVersions = [...versions].sort((a, b) =>
    a.createdAt > b.createdAt ? -1 : 1,
  );

  const currentVersionId = getWorkflowCurrentVersion({
    versions: workflowVersions,
    lastPublishedVersionId: coreWorkflow?.lastPublishedVersionId,
  })?.id;

  const currentVersion = useCoreWorkflowVersionContent({
    coreWorkflowId: workflowId,
    coreWorkflowVersionId: currentVersionId,
  });

  if (!isDefined(coreWorkflow) || !isDefined(currentVersion)) {
    return undefined;
  }

  return {
    ...coreWorkflow,
    __typename: 'Workflow',
    versions: workflowVersions,
    currentVersion,
  };
};
