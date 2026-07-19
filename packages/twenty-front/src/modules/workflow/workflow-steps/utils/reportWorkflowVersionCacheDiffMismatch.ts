import { type Difference } from 'microdiff';

import { type WorkflowVersion } from '@/workflow/types/Workflow';

export const reportWorkflowVersionCacheDiffMismatch = async ({
  error,
  workflowVersionId,
  cachedSteps,
  stepsDiff,
}: {
  error: unknown;
  workflowVersionId: string;
  cachedSteps: WorkflowVersion['steps'];
  stepsDiff: Difference[] | null | undefined;
}) => {
  try {
    const { captureException, withScope } = await import('@sentry/react');

    withScope((scope) => {
      const monitoringError = new Error(
        'Workflow version cache diff could not be applied',
      );
      monitoringError.name = 'WorkflowVersionCacheDiffMismatch';

      scope.setLevel('warning');
      scope.setTag('feature', 'workflow-version-cache');
      scope.setTag('operation', 'apply-workflow-version-diff');
      scope.setTag('cause', 'diff-cache-mismatch');
      scope.setExtra('workflow_version_id', workflowVersionId);
      scope.setExtra(
        'diff_paths',
        Array.isArray(stepsDiff)
          ? stepsDiff.map((diff) => diff.path.map(String).join('.'))
          : [],
      );
      scope.setExtra(
        'cached_steps_shape',
        cachedSteps === null
          ? 'null'
          : Array.isArray(cachedSteps)
            ? 'array'
            : typeof cachedSteps,
      );
      scope.setExtra(
        'apply_diff_error',
        error instanceof Error ? error.message : String(error),
      );

      captureException(monitoringError);
    });
  } catch (sentryError) {
    // oxlint-disable-next-line no-console
    console.error(
      'Failed to capture workflow version cache diff mismatch with Sentry:',
      sentryError,
    );
  }
};
