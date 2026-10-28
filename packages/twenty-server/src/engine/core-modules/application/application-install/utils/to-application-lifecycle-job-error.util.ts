import { formatValidationErrors } from 'src/engine/workspace-manager/workspace-migration/utils/format-validation-errors.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

// The job's failedReason is the error message, the only text the CLI and the front show
export const toApplicationLifecycleJobError = (error: unknown): unknown =>
  error instanceof WorkspaceMigrationBuilderException
    ? new WorkspaceMigrationBuilderException(
        error.failedWorkspaceMigrationBuildResult,
        formatValidationErrors(error),
      )
    : error;
