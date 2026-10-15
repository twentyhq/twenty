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
  onProgress,
}: {
  universalIdentifier: string;
  completedPhases: AppInstallPhase[];
  target: ResolvedTarget;
  signal: AbortSignal;
  onProgress: (percentage: number) => void;
}) => {
  const timeout = AbortSignal.timeout(APP_INSTALL.TIMEOUT_MILLISECONDS);
  const installSignal = AbortSignal.any([signal, timeout]);
  const client = createMetadataClient({ target, signal: installSignal });

  const fail = (error: unknown, phase: AppInstallPhase, jobId?: string) =>
    createInstallFailure({
      error:
        timeout.aborted && !signal.aborted
          ? new CliError({
              code: 'TIMEOUT',
              message: `Timed out waiting for the app installation after ${APP_INSTALL.TIMEOUT_MILLISECONDS / 1_000}s.`,
            })
          : error,
      phase,
      completedPhases,
      universalIdentifier,
      jobId,
      signal,
    });

  const jobId = await client
    .mutation({
      __name: 'TriggerInstallApplication',
      triggerInstallApplication: {
        __args: { input: { universalIdentifier } },
        jobId: true,
      },
    })
    .then((result) => {
      const installation = result?.triggerInstallApplication;

      if (
        !isPlainObject(installation) ||
        !isNonEmptyString(installation.jobId)
      ) {
        throw new CliError({
          code: 'INVALID_RESPONSE',
          message: 'The server did not return an installation job identifier.',
        });
      }

      return installation.jobId;
    })
    .catch((error: unknown) => {
      throw fail(error, 'start');
    });

  completedPhases.push('start');

  await waitForAppInstall({
    universalIdentifier,
    jobId,
    target,
    signal: installSignal,
    onProgress,
  }).catch((error: unknown) => {
    throw fail(error, 'wait', jobId);
  });
  completedPhases.push('wait');

  const application = await fetchInstalledApp({
    universalIdentifier,
    target,
    signal: installSignal,
  }).catch((error: unknown) => {
    throw fail(error, 'check', jobId);
  });

  return {
    application: { universalIdentifier, name: application.name },
    installed: true,
    jobId,
  };
};
