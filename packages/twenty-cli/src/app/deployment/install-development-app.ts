import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { isSameUniversalIdentifier } from '@/app/is-same-universal-identifier';
import { type ToolingBuild } from '@/app/types/tooling-result.type';
import { CliError } from '@/output/cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

export const installDevelopmentApp = async ({
  application,
  target,
  signal,
}: {
  application: ToolingBuild['application'];
  target: ResolvedTarget;
  signal: AbortSignal;
}) => {
  const data = await createMetadataClient({ target, signal }).mutation({
    __name: 'InstallDevelopmentApplication',
    createDevelopmentApplication: {
      __args: {
        universalIdentifier: application.universalIdentifier,
        name: application.displayName,
      },
      id: true,
      universalIdentifier: true,
    },
  });
  const installation = data?.createDevelopmentApplication;

  if (
    !isPlainObject(installation) ||
    !isNonEmptyString(installation.id) ||
    !isSameUniversalIdentifier({
      value: installation.universalIdentifier,
      universalIdentifier: application.universalIdentifier,
    })
  ) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: 'The server returned an invalid development installation.',
    });
  }

  return { applicationId: installation.id };
};
