import execa from 'execa';

import { CliError } from '@/output/cli-error';
import { createCancelledError } from '@/output/create-cancelled-error';

export const runDocker = async ({
  args,
  signal,
  onOutput,
}: {
  args: string[];
  signal: AbortSignal;
  onOutput?: (message: string) => Promise<void>;
}) => {
  signal.throwIfAborted();

  const subprocess = execa('docker', args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    all: true,
    buffer: !onOutput,
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
    if (onOutput && subprocess.all) {
      for await (const chunk of subprocess.all) {
        await onOutput(String(chunk));
      }
    }

    const result = await subprocess;

    signal.throwIfAborted();

    if (result.failed) {
      throw new CliError({
        code: 'LOCAL_ENVIRONMENT_FAILED',
        message: result.stderr?.trim()
          ? `docker ${args[0]} failed: ${result.stderr.trim().slice(-4096)}`
          : `docker ${args[0]} failed.`,
        hint: 'Check Docker is installed and running, then retry.',
        details: {
          exitCode: result.exitCode,
          stderr: result.stderr?.slice(-16384) ?? '',
        },
      });
    }

    return result.stdout ?? '';
  } catch (error) {
    cancel();
    await subprocess.catch(() => undefined);
    if (signal.aborted) {
      throw createCancelledError();
    }
    throw error;
  } finally {
    signal.removeEventListener('abort', cancel);
  }
};
