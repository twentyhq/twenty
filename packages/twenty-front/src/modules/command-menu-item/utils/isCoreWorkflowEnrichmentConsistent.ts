import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuWorkflowFromCore } from '@/command-menu-item/types/CommandMenuWorkflow';

export const isCoreWorkflowEnrichmentConsistent = ({
  selectedWorkflowRecords,
  coreWorkflows,
}: {
  selectedWorkflowRecords: { id: string; coreWorkflowId?: string | null }[];
  coreWorkflows: Pick<
    CommandMenuWorkflowFromCore,
    'id' | 'workspaceWorkflowId'
  >[];
}): boolean =>
  selectedWorkflowRecords.every((selectedWorkflowRecord) => {
    const coreWorkflow = coreWorkflows.find(
      (coreWorkflowCandidate) =>
        coreWorkflowCandidate.id === selectedWorkflowRecord.coreWorkflowId,
    );

    return (
      isDefined(coreWorkflow) &&
      coreWorkflow.workspaceWorkflowId === selectedWorkflowRecord.id
    );
  });
