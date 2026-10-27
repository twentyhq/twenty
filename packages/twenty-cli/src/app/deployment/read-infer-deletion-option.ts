import { readBooleanOption } from '@/catalog/read-command-values';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { CliError } from '@/output/cli-error';

// Undefined leaves the default to the server, which depends on the application.
export const readInferDeletionOption = (
  options: Record<string, unknown>,
): boolean | undefined => {
  const isPruneRequested = readBooleanOption(options, 'prune');
  const isDeletionRefused = options.delete === false;

  if (isPruneRequested && isDeletionRefused) {
    throw new CliError({
      code: 'USAGE',
      exitCode: EXIT_CODE.USAGE,
      message: '--prune and --no-delete cannot be used together.',
    });
  }

  if (isPruneRequested) {
    return true;
  }

  return isDeletionRefused ? false : undefined;
};
