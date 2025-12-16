import type { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';

export const formatValidationErrors = (
  error: WorkspaceMigrationBuilderExceptionV2,
): string => {
  const report = error.failedWorkspaceMigrationBuildResult.report;
  const errorMessages: string[] = [];

  for (const [entityType, failures] of Object.entries(report)) {
    if (Array.isArray(failures) && failures.length > 0) {
      for (const failure of failures) {
        if (failure.errors && Array.isArray(failure.errors)) {
          for (const validationError of failure.errors) {
            const message = validationError.message || validationError.code;

            errorMessages.push(`[${entityType}] ${message}`);
          }
        }
      }
    }
  }

  if (errorMessages.length === 0) {
    return error.message;
  }

  return `Validation errors:\n${errorMessages.join('\n')}`;
};
