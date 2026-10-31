import valid from 'semver/functions/valid';
import { isDefined } from 'twenty-shared/utils';

import { readLocalImageEnvironment } from '@/local/read-local-image-environment';
import { CliError } from '@/output/cli-error';

export const readLocalImageVersion = async ({
  imageId,
  signal,
}: {
  imageId: string;
  signal: AbortSignal;
}) => {
  const environmentVariables = await readLocalImageEnvironment({
    imageId,
    signal,
  });
  const version = valid(
    environmentVariables
      .find((value) => value.startsWith('APP_VERSION='))
      ?.slice('APP_VERSION='.length),
  );

  if (!isDefined(version)) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: `Cannot determine the Twenty version of image ${imageId}.`,
      hint: 'Upgrade requires images with a valid APP_VERSION to prevent database downgrades. The existing instance is unchanged.',
    });
  }

  return version;
};
