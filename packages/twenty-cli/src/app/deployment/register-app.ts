import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { isSameUniversalIdentifier } from '@/app/is-same-universal-identifier';
import { type ToolingBuild } from '@/app/types/tooling-result.type';
import { CliError } from '@/output/cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

export const registerApp = async ({
  application,
  target,
  signal,
}: {
  application: ToolingBuild['application'];
  target: ResolvedTarget;
  signal: AbortSignal;
}) => {
  const data = await createMetadataClient({ target, signal }).mutation({
    __name: 'RegisterApplication',
    createApplicationRegistration: {
      __args: {
        input: {
          name: application.displayName,
          universalIdentifier: application.universalIdentifier,
        },
      },
      applicationRegistration: { id: true, universalIdentifier: true },
    },
  });
  const created = data?.createApplicationRegistration;
  const registration = isPlainObject(created)
    ? created.applicationRegistration
    : undefined;

  if (
    !isPlainObject(registration) ||
    !isNonEmptyString(registration.id) ||
    !isSameUniversalIdentifier({
      value: registration.universalIdentifier,
      universalIdentifier: application.universalIdentifier,
    })
  ) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: 'The server returned an invalid application registration.',
    });
  }

  return { registrationId: registration.id };
};
