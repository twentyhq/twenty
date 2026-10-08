import { isDefined } from 'twenty-shared/utils';

import {
  type AppApplyResult,
  applyAppBuild,
} from '@/app/deployment/apply-app-build';
import { createPostSyncFailure } from '@/app/deployment/create-post-sync-failure';
import { formatApplySummary } from '@/app/deployment/format-apply-summary';
import { generateAppClient } from '@/app/generate-app-client';
import { getAppPlanSummary } from '@/app/deployment/get-app-plan-summary';
import { getClientGenerationSkipReason } from '@/app/get-client-generation-skip-reason';
import { collectSourceFingerprints } from '@/app/pull/collect-source-fingerprints';
import { type PullBaseRecording, recordPullBase } from '@/app/record-pull-base';
import { resolveAppProject } from '@/app/project/resolve-app-project';
import { runAppBuild } from '@/app/run-app-operation';
import {
  readBooleanOption,
  readStringOption,
} from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { CliError } from '@/output/cli-error';

export const runAppApplyCommand: CommandRun<TargetCommandContext> = async (
  context,
) => {
  const startedAt = performance.now();
  const inferDeletionFromMissingEntities = context.options.delete !== false;
  let applyResult: AppApplyResult | undefined;
  const appProject = await resolveAppProject({
    explicitPath: readStringOption(context.options, 'path'),
    workingDirectory: process.cwd(),
  });
  const sourceFingerprints = await collectSourceFingerprints(
    appProject.path,
  ).catch(() => undefined);

  const {
    project,
    sdk,
    data: build,
    diagnostics,
  } = await runAppBuild({
    context,
    useHeldBuild: async (heldBuild) => {
      applyResult = await applyAppBuild({
        build: heldBuild.data,
        appPath: heldBuild.project.path,
        context,
        inferDeletionFromMissingEntities,
        isCreationApproved: readBooleanOption(context.options, 'create'),
        isDeletionApproved: readBooleanOption(context.options, 'yes'),
      });
    },
  });

  if (!isDefined(applyResult)) {
    throw new CliError({
      code: 'TOOLING_UNSUPPORTED',
      message:
        'The app worker did not keep its build snapshot for upload, so nothing was applied.',
    });
  }

  const summary = isDefined(applyResult.appliedActions)
    ? getAppPlanSummary(applyResult.appliedActions)
    : undefined;

  if (!isDefined(summary)) {
    context.output.warn({
      code: 'SYNC_REPORT_UNAVAILABLE',
      message:
        'The sync succeeded, but the server did not return a readable list of its changes.',
    });
  }

  let pullBase: PullBaseRecording;

  try {
    pullBase = await recordPullBase({
      appPath: project.path,
      universalIdentifier: applyResult.acknowledgedUniversalIdentifier,
      sourceFingerprints,
      context,
    });
    if (pullBase === 'recorded') {
      applyResult.completedPhases.push('pullBase');
    }
  } catch (error) {
    throw createPostSyncFailure({
      error,
      phase: 'pullBase',
      applicationName: build.application.displayName,
      apiUrl: context.target.apiUrl,
      completedPhases: applyResult.completedPhases,
      signal: context.signal,
    });
  }

  const clientGenerationSkipReason = await getClientGenerationSkipReason({
    appPath: project.path,
  });
  let clientGeneration: 'generated' | 'skipped' = 'skipped';

  if (isDefined(clientGenerationSkipReason)) {
    context.output.warn({
      code: 'CLIENT_NOT_GENERATED',
      message: `The app's typed API client was not regenerated: ${clientGenerationSkipReason}`,
    });
  } else {
    try {
      diagnostics.push(
        ...(await generateAppClient({
          appPath: project.path,
          applicationUniversalIdentifier:
            applyResult.acknowledgedUniversalIdentifier,
          sdk,
          context,
        })),
      );
      clientGeneration = 'generated';
      applyResult.completedPhases.push('clientGeneration');
    } catch (error) {
      throw createPostSyncFailure({
        error,
        phase: 'clientGeneration',
        applicationName: build.application.displayName,
        apiUrl: context.target.apiUrl,
        completedPhases: applyResult.completedPhases,
        signal: context.signal,
      });
    }
  }

  const durationMilliseconds = Math.round(performance.now() - startedAt);

  return {
    data: {
      app: { path: project.path, name: project.name },
      sdk: { version: sdk.version },
      application: build.application,
      contentHash: build.contentHash,
      inferDeletionFromMissingEntities,
      registrationCreated: applyResult.isRegistrationCreated,
      completedPhases: applyResult.completedPhases,
      actions: applyResult.appliedActions ?? null,
      summary: summary ?? null,
      upload: {
        fileCount: applyResult.upload.fileCount,
        byteCount: applyResult.upload.byteCount,
      },
      clientGeneration,
      pullBase,
      diagnostics,
      durationMilliseconds,
    },
    human: formatApplySummary({
      applicationName: build.application.displayName,
      apiUrl: context.target.apiUrl,
      summary,
      upload: applyResult.upload,
      isRegistrationCreated: applyResult.isRegistrationCreated,
      clientGeneration,
      durationMilliseconds,
    }),
  };
};
