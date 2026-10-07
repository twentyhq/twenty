import { formatValidationErrors } from 'src/engine/core-modules/tool-provider/utils/format-validation-errors.util';
import { isUserFacingToolExecutionError } from 'src/engine/core-modules/tool-provider/utils/is-user-facing-tool-execution-error.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { shouldCaptureException } from 'src/engine/utils/global-exception-handler.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

// Only an included chat turn keeps running once the allowance is spent, so the
// model must not tell the member their chat is out of credits
const CREDIT_ALLOWANCE_EXHAUSTED_TOOL_ERROR =
  'This tool uses credits and the workspace has none left.';

const getToolExecutionErrorMessage = (error: unknown): string => {
  if (error instanceof WorkspaceMigrationBuilderException) {
    return formatValidationErrors(error);
  }

  if (
    error instanceof UsageLimitException &&
    error.code === UsageLimitExceptionCode.QUOTA_EXHAUSTED &&
    error.exhaustedScope?.exhaustedKind === 'allowance'
  ) {
    return CREDIT_ALLOWANCE_EXHAUSTED_TOOL_ERROR;
  }

  return error instanceof Error ? error.message : String(error);
};

export const buildToolExecutionFailure = ({
  error,
  toolName,
}: {
  error: unknown;
  toolName: string;
}): { output: ToolOutput; shouldCapture: boolean } => ({
  output: {
    success: false,
    message: `Failed to execute ${toolName}`,
    error: getToolExecutionErrorMessage(error),
  },
  shouldCapture:
    !(error instanceof Error) ||
    (!isUserFacingToolExecutionError(error) && shouldCaptureException(error)),
});
