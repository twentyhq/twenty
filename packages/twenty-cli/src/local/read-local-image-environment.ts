import { isArray, isString } from '@sniptt/guards';

import { runDocker } from '@/local/run-docker';
import { CliError } from '@/output/cli-error';

export const readLocalImageEnvironment = async ({
  imageId,
  signal,
}: {
  imageId: string;
  signal: AbortSignal;
}): Promise<string[]> => {
  const defaults: unknown = JSON.parse(
    await runDocker({
      args: ['image', 'inspect', '--format', '{{json .Config.Env}}', imageId],
      signal,
    }),
  );
  if (!isArray(defaults) || !defaults.every(isString)) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: 'Docker returned invalid image environment variables.',
    });
  }

  return defaults;
};
