import { isNonEmptyString } from '@sniptt/guards';
import execa from 'execa';
import { isDefined } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';
import { createCancelledError } from '@/output/create-cancelled-error';

export const runNpmCommand = async ({
  args,
  appPath,
  signal,
  canInteract = false,
  onOutput,
}: {
  args: string[];
  appPath: string;
  signal: AbortSignal;
  canInteract?: boolean;
  onOutput?: (message: string) => void;
}) => {
  signal.throwIfAborted();

  const subprocess = execa('npm', args, {
    cwd: appPath,
    stdio: canInteract ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    reject: false,
    maxBuffer: 4 * 1024 * 1024,
  });
  const cancel = () =>
    subprocess.kill('SIGTERM', { forceKillAfterTimeout: 1000 });

  signal.addEventListener('abort', cancel, { once: true });

  if (signal.aborted) {
    cancel();
  }

  try {
    const result = await subprocess;

    if (signal.aborted) {
      throw createCancelledError();
    }

    if (!canInteract && isDefined(onOutput)) {
      if (isNonEmptyString(result.stdout)) {
        onOutput(result.stdout);
      }
      if (isNonEmptyString(result.stderr)) {
        onOutput(result.stderr);
      }
    }

    if (result.failed) {
      throw new CliError({
        code: 'PUBLISH_FAILED',
        message: `npm ${args[0]} failed.`,
        hint: 'Check that npm is installed and your npm registry credentials and package version are valid.',
        details: {
          exitCode: result.exitCode,
          stdout: result.stdout?.slice(-16384) ?? '',
          stderr: result.stderr?.slice(-16384) ?? '',
        },
      });
    }

    return result.stdout ?? '';
  } finally {
    signal.removeEventListener('abort', cancel);
  }
};
