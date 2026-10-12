import { getToolExecutionErrorMessage } from 'src/engine/core-modules/tool-provider/utils/build-tool-execution-failure.util';
import { isUserFacingToolExecutionError } from 'src/engine/core-modules/tool-provider/utils/is-user-facing-tool-execution-error.util';
import { AiException } from 'src/engine/metadata-modules/ai/ai.exception';

// Validation and lookup errors are for the model to fix; anything else is rethrown so the tool executor reports it
export const toAgentToolFailureOrThrow = ({
  error,
  action,
}: {
  error: unknown;
  action: string;
}) => {
  if (
    !isUserFacingToolExecutionError(error) &&
    !(error instanceof AiException)
  ) {
    throw error;
  }

  const message = getToolExecutionErrorMessage(error);

  return {
    success: false,
    message: `Failed to ${action}: ${message}`,
    error: message,
  };
};
