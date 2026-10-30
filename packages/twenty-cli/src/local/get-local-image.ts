import valid from 'semver/functions/valid';
import { isDefined } from 'twenty-shared/utils';

import { LOCAL_IMAGE_REPOSITORY } from '@/local/get-local-environment';
import { CliError } from '@/output/cli-error';

export const getLocalImage = (version: string) => {
  const normalized = valid(version);
  const tag = isDefined(normalized) ? `v${normalized}` : version;

  if (!/^[a-zA-Z0-9_][a-zA-Z0-9_.-]{0,127}$/.test(tag)) {
    throw new CliError({
      code: 'INVALID_INPUT',
      message:
        'Use a server version such as 2.53.1 or a valid image tag such as latest.',
    });
  }

  return `${LOCAL_IMAGE_REPOSITORY}:${tag}`;
};
