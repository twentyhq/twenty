import { formatValidationErrors } from 'src/engine/core-modules/tool-provider/utils/format-validation-errors.util';
import { isUserFacingToolExecutionError } from 'src/engine/core-modules/tool-provider/utils/is-user-facing-tool-execution-error.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { shouldCaptureException } from 'src/engine/utils/global-exception-handler.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

const getToolExecutionErrorMessage = (error: unknown): string => {
  if (error instanceof WorkspaceMigrationBuilderException) {
    return formatValidationErrors(error);
  }

  return error instanceof Error ? error.message : String(error);
};

export const buildToolExecutionFailure = (
  error: unknown,
  toolName: string,
): { output: ToolOutput; shouldCapture: boolean } => ({
  output: {
    success: false,
    message: `Failed to execute ${toolName}`,
    error: getToolExecutionErrorMessage(error),
  },
  shouldCapture:
    !(error instanceof Error) ||
    (!isUserFacingToolExecutionError(error) && shouldCaptureException(error)),
});
