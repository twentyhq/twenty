import { CliError } from '@/output/cli-error';
import { createCancelledError } from '@/output/create-cancelled-error';

export const toCliError = (error: unknown, signal?: AbortSignal): CliError => {
  if (error instanceof CliError) {
    return error;
  }

  if (signal?.aborted === true) {
    return createCancelledError();
  }

  return new CliError({
    code: 'INTERNAL_ERROR',
    message: error instanceof Error ? error.message : String(error),
  });
};
