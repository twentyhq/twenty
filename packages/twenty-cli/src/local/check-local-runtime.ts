import { runDocker } from '@/local/run-docker';
import { CliError } from '@/output/cli-error';

export const checkLocalRuntime = async (signal: AbortSignal) => {
  const endpoint =
    process.env.DOCKER_HOST && !process.env.DOCKER_CONTEXT
      ? process.env.DOCKER_HOST
      : (
          await runDocker({
            args: [
              'context',
              'inspect',
              '--format',
              '{{.Endpoints.docker.Host}}',
            ],
            signal,
          })
        ).trim();

  if (!endpoint.startsWith('unix://') && !endpoint.startsWith('npipe://')) {
    throw new CliError({
      code: 'INVALID_CONFIG',
      message: 'Local environments require a local Docker socket.',
      hint: 'Select a local Docker context and unset any remote DOCKER_HOST override.',
    });
  }

  await runDocker({ args: ['info', '--format', '{{.ServerVersion}}'], signal });
};
