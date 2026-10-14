import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { APP_INSTALL } from '@/app/deployment/constants/app-install.constant';
import { createInstallFailure } from '@/app/deployment/create-install-failure';
import { type AppInstallPhase } from '@/app/deployment/types/app-install-phase.type';
import { waitForAppInstall } from '@/app/deployment/wait-for-app-install';
import { fetchInstalledApp } from '@/app/fetch-installed-app';
import { CliError } from '@/output/cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

export const installRegisteredApp = async ({
  universalIdentifier,
  completedPhases,
  target,
  signal,
  onQueued,
}: {
  universalIdentifier: string;
  completedPhases: AppInstallPhase[];
  target: ResolvedTarget;
  signal: AbortSignal;
  onQueued: (jobId: string) => void;
}) => {
  let phase: AppInstallPhase = 'start';
  let jobId: string | undefined;
  const timeout = AbortSignal.timeout(APP_INSTALL.TIMEOUT_MILLISECONDS);
  const installSignal = AbortSignal.any([signal, timeout]);
  const client = createMetadataClient({ target, signal: installSignal });

  const fail = (error: unknown) =>
    createInstallFailure({
      error,
      phase,
      completedPhases,
      universalIdentifier,
      jobId,
      signal,
    });

  try {
    installSignal.throwIfAborted();
    const result = await client.mutation({
      __name: 'TriggerInstallApplication',
      triggerInstallApplication: {
        __args: { input: { universalIdentifier } },
        jobId: true,
      },
    });
    const installation = result?.triggerInstallApplication;

    if (!isPlainObject(installation) || !isNonEmptyString(installation.jobId)) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message: 'The server did not return an installation job identifier.',
      });
    }

    jobId = installation.jobId;
    completedPhases.push('start');
    phase = 'wait';
    onQueued(jobId);

    await waitForAppInstall({
      universalIdentifier,
      jobId,
      target,
      signal: installSignal,
    });
    completedPhases.push('wait');

    phase = 'check';
    const application = await fetchInstalledApp({
      universalIdentifier,
      target,
      signal: installSignal,
    });

    return {
      application: { universalIdentifier, name: application.name },
      installed: true,
      jobId,
    };
  } catch (error) {
    if (timeout.aborted && !signal.aborted) {
      throw fail(
        new CliError({
          code: 'TIMEOUT',
          message:
            'Timed out waiting for the app installation after 10 minutes.',
        }),
      );
    }

    throw fail(error);
  }
};
