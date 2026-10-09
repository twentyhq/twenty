import { type ToolingDiagnostic } from '@/app/types/tooling-result.type';
import { CliError } from '@/output/cli-error';
import { createCancelledError } from '@/output/create-cancelled-error';

export const createToolingFailure = ({
  error,
  diagnostics,
  sdkVersion,
  operation = 'build',
}: {
  error: {
    code: string;
    message: string;
    hint?: string;
    details?: Record<string, unknown>;
  };
  diagnostics: ToolingDiagnostic[];
  sdkVersion: string;
  operation?: 'build' | 'generateClient';
}) => {
  if (error.code === 'CANCELLED') {
    return createCancelledError();
  }

  const errorCount = diagnostics.filter(
    (diagnostic) => diagnostic.severity === 'error',
  ).length;
  const errorLabel = errorCount === 1 ? 'error' : 'errors';
  const details = {
    ...error.details,
    toolingErrorCode: error.code,
    sdkVersion,
    diagnostics,
  };

  switch (error.code) {
    case 'SDK_SOURCE_UNSUPPORTED':
    case 'TYPESCRIPT_NOT_INSTALLED':
    case 'TOOLING_UNSUPPORTED':
    case 'NODE_VERSION_UNSUPPORTED':
      return new CliError({
        code: error.code,
        message: error.message,
        hint: error.hint,
        details,
      });
  }

  if (error.code === 'TYPECHECK_FAILED') {
    return new CliError({
      code: 'TYPECHECK_FAILED',
      message:
        errorCount > 0
          ? `Typecheck failed with ${errorCount} ${errorLabel}.`
          : `Typecheck failed: ${error.message}`,
      hint: error.hint,
      details,
    });
  }

  return new CliError({
    code:
      operation === 'generateClient'
        ? 'CLIENT_GENERATION_FAILED'
        : 'BUILD_FAILED',
    message:
      operation === 'generateClient'
        ? error.message
        : `The build failed: ${error.message}`,
    hint: error.hint,
    details,
  });
};
