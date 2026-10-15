import { isNonEmptyString } from '@sniptt/guards';
import { setTimeout as delay } from 'node:timers/promises';
import { MetadataSchema } from 'twenty-client-sdk/metadata';
import { isPlainObject } from 'twenty-shared/utils';

import { APP_INSTALL } from '@/app/deployment/constants/app-install.constant';
import { CliError } from '@/output/cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

export const waitForAppInstall = async ({
  universalIdentifier,
  jobId,
  target,
  signal,
}: {
  universalIdentifier: string;
  jobId: string;
  target: ResolvedTarget;
  signal: AbortSignal;
}) => {
  const client = createMetadataClient({ target, signal });

  while (true) {
    signal.throwIfAborted();
    const data = await client.query({
      __name: 'FindInstallApplicationJobStatus',
      findInstallApplicationJobStatus: {
        __args: { universalIdentifier, jobId },
        jobId: true,
        state: true,
        failedReason: true,
      },
    });
    const status = data?.findInstallApplicationJobStatus;

    if (
      !isPlainObject(status) ||
      status.jobId !== jobId ||
      !Object.values(MetadataSchema.enumJobState).includes(status.state)
    ) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message:
          'The server did not return the status of the requested installation job.',
      });
    }

    if (status.state === 'FAILED') {
      throw new CliError({
        code: 'INSTALL_FAILED',
        message: isNonEmptyString(status.failedReason)
          ? status.failedReason
          : 'The app installation job failed.',
      });
    }

    if (status.state === 'COMPLETED') {
      break;
    }

    await delay(APP_INSTALL.POLL_INTERVAL_MILLISECONDS, undefined, {
      signal,
    });
  }
};
