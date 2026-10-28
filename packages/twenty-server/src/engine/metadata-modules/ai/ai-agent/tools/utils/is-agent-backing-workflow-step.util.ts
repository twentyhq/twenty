import { WorkflowActionType } from 'twenty-shared/workflow';

import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';

export const isAgentBackingWorkflowStep = ({
  agentId,
  flatWorkflowVersions,
}: {
  agentId: string;
  flatWorkflowVersions: Pick<FlatWorkflowVersion, 'steps'>[];
}): boolean =>
  flatWorkflowVersions.some((flatWorkflowVersion) =>
    (flatWorkflowVersion.steps ?? []).some(
      (step) =>
        step.type === WorkflowActionType.AI_AGENT &&
        step.settings?.input?.agentId === agentId,
    ),
  );
