import execa from 'execa';

import { createAppWorkerEnvironment } from '@/app/create-app-worker-environment';
import { formatDataValue } from '@/data/format-data-value';
import { CliError } from '@/output/cli-error';
import { createCancelledError } from '@/output/create-cancelled-error';
import { type Output } from '@/output/types/output.type';

export const installAppDependenciesOrThrow = async ({
  appPath,
  signal,
  output,
}: {
  appPath: string;
  signal: AbortSignal;
  output: Output;
}) => {
  signal.throwIfAborted();
  output.progress({
    message: 'Installing app dependencies with yarn install…',
  });

  const subprocess = execa('yarn', ['install'], {
    cwd: appPath,
    env: {
      ...createAppWorkerEnvironment(process.env),
      YARN_ENABLE_IMMUTABLE_INSTALLS: 'false',
      COREPACK_ENABLE_DOWNLOAD_PROMPT: '0',
    },
    extendEnv: false,
    stdio: ['ignore', 'pipe', 'pipe'],
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

    if (result.failed) {
      const diagnostic = (result.stderr?.trim() || result.stdout?.trim() || '')
        .slice(-4000)
        .split('\n')
        .map(formatDataValue)
        .join('\n');

      throw new CliError({
        code: 'APP_INIT_FAILED',
        message: 'Could not install dependencies for the new app.',
        hint: [
          diagnostic,
          `The project was created at ${formatDataValue(appPath)}. Fix the installation error, run yarn install there, then run twenty app pull again.`,
        ]
          .filter(Boolean)
          .join('\n'),
        details: {
          path: appPath,
          exitCode: result.exitCode,
          stdout: result.stdout?.slice(-16384) ?? '',
          stderr: result.stderr?.slice(-16384) ?? '',
        },
      });
    }
  } finally {
    signal.removeEventListener('abort', cancel);
  }
};
