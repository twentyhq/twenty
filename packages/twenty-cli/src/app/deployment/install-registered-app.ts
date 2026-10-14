import { isNonEmptyString } from '@sniptt/guards';
import { setTimeout as delay } from 'node:timers/promises';
import { MetadataSchema } from 'twenty-client-sdk/metadata';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { APP_INSTALL } from '@/app/deployment/constants/app-install.constant';
import { fetchInstalledApp } from '@/app/fetch-installed-app';
import { CliError } from '@/output/cli-error';
import { toCliError } from '@/output/to-cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

export const installRegisteredApp = async ({
  universalIdentifier,
  target,
  signal,
  onQueued,
}: {
  universalIdentifier: string;
  target: ResolvedTarget;
  signal: AbortSignal;
  onQueued: (jobId: string) => void;
}) => {
  let phase: 'start' | 'wait' | 'check' = 'start';
  let jobId: string | undefined;
  const timeout = AbortSignal.timeout(APP_INSTALL.TIMEOUT_MILLISECONDS);
  const installSignal = AbortSignal.any([signal, timeout]);
  const client = createMetadataClient({ target, signal: installSignal });

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

    const installationJobId = installation.jobId;

    jobId = installationJobId;
    phase = 'wait';
    onQueued(jobId);

    while (true) {
      installSignal.throwIfAborted();
      const data = await client.query({
        __name: 'FindInstallApplicationJobStatus',
        findInstallApplicationJobStatus: {
          __args: { universalIdentifier, jobId: installationJobId },
          jobId: true,
          state: true,
          failedReason: true,
        },
      });
      const status = data?.findInstallApplicationJobStatus;

      if (
        !isPlainObject(status) ||
        status.jobId !== installationJobId ||
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
        signal: installSignal,
      });
    }

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
    const failure =
      timeout.aborted && !signal.aborted
        ? new CliError({
            code: 'TIMEOUT',
            message:
              'Timed out waiting for the app installation after 10 minutes.',
          })
        : toCliError(error, signal);
    const isRejected =
      phase === 'start' &&
      ['AUTH_REQUIRED', 'PERMISSION_DENIED', 'NOT_FOUND'].includes(
        failure.code,
      );

    throw new CliError({
      cause: failure,
      code: failure.code,
      exitCode: failure.exitCode,
      message: failure.message,
      hint: isRejected
        ? (failure.hint ??
          'Check the target workspace, registration and APPLICATIONS permission before retrying.')
        : 'The installation may have partly run or may still be running on the server. Check the app in workspace settings before retrying; stopping the CLI does not cancel the server job.',
      details: {
        ...failure.details,
        universalIdentifier,
        ...(isDefined(jobId) ? { jobId } : {}),
        phase,
        outcome: isRejected
          ? 'not-started'
          : failure.code === 'INSTALL_FAILED'
            ? 'failed'
            : 'unknown',
      },
    });
  }
};
