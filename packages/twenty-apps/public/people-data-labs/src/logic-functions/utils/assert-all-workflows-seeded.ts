import { type PostInstallResult } from 'src/types/post-install-result';

export const assertAllWorkflowsSeeded = ({
  seededWorkflows,
}: PostInstallResult): void => {
  const failedWorkflows = seededWorkflows.filter(
    (seededWorkflow) => seededWorkflow.status === 'failed',
  );

  if (failedWorkflows.length === 0) {
    return;
  }

  const details = failedWorkflows
    .map(
      (seededWorkflow) =>
        `${seededWorkflow.workflowName}: ${seededWorkflow.error ?? 'unknown error'}`,
    )
    .join('; ');

  throw new Error(
    `${failedWorkflows.length} enrichment workflow(s) could not be seeded: ${details}`,
  );
};
