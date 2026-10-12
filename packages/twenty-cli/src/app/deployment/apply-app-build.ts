import { createApplyFailure } from '@/app/deployment/create-apply-failure';
import { fetchAppPlan } from '@/app/deployment/fetch-app-plan';
import { formatAppPlanActions } from '@/app/deployment/format-app-plan';
import { getAppPlanSummary } from '@/app/deployment/get-app-plan-summary';
import { installDevelopmentApp } from '@/app/deployment/install-development-app';
import { registerApp } from '@/app/deployment/register-app';
import { requireApproval } from '@/app/deployment/require-approval';
import { resolveSnapshotDirectory } from '@/app/deployment/resolve-snapshot-directory';
import { syncAppManifest } from '@/app/deployment/sync-app-manifest';
import { type AppApplyPhase } from '@/app/deployment/types/app-apply-phase.type';
import { type AppPlanAction } from '@/app/deployment/types/app-plan.type';
import { type AppUploadProgress } from '@/app/deployment/types/app-upload-progress.type';
import { type ToolingBuild } from '@/app/types/tooling-result.type';
import { uploadAppFiles } from '@/app/deployment/upload-app-files';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { CliError } from '@/output/cli-error';
import { type CliErrorCode } from '@/output/types/cli-error-code.type';
import { isInteractionAllowed } from '@/program/is-interaction-allowed';

export type AppApplyResult = {
  completedPhases: AppApplyPhase[];
  isRegistrationCreated: boolean;
  appliedActions: AppPlanAction[] | undefined;
  acknowledgedUniversalIdentifier: string;
  upload: AppUploadProgress;
};

const isPlanUnavailable = (error: unknown) =>
  error instanceof CliError && error.code === 'PLAN_UNAVAILABLE';

export const applyAppBuild = async ({
  build,
  appPath,
  context: { target, signal, output, outputMode, options },
  inferDeletionFromMissingEntities,
  isCreationApproved,
  isDeletionApproved,
  approvalSignal,
  beforeWrite,
  flushProgress,
}: {
  build: ToolingBuild;
  appPath: string;
  context: TargetCommandContext;
  inferDeletionFromMissingEntities: boolean;
  isCreationApproved: boolean;
  isDeletionApproved: boolean;
  approvalSignal?: AbortSignal;
  beforeWrite?: () => void;
  flushProgress?: () => Promise<void>;
}): Promise<AppApplyResult> => {
  const completedPhases: AppApplyPhase[] = ['build'];
  const upload: AppUploadProgress = {
    fileCount: 0,
    byteCount: 0,
    hasCreatedTargets: false,
  };
  const canPrompt = isInteractionAllowed({ options, outputMode });
  const application = build.application;

  const fail = (error: unknown, phase: AppApplyPhase) =>
    createApplyFailure({
      error,
      phase,
      completedPhases,
      upload,
      signal,
    });

  const runPhase = async <TResult>(
    phase: AppApplyPhase,
    run: () => Promise<TResult>,
  ) => {
    await flushProgress?.().catch((error: unknown) => {
      throw fail(error, 'confirmation');
    });

    if (['registration', 'installation', 'upload', 'sync'].includes(phase)) {
      try {
        beforeWrite?.();
      } catch (error) {
        throw fail(error, 'confirmation');
      }
    }

    try {
      const result = await run();

      completedPhases.push(phase);

      return result;
    } catch (error) {
      throw fail(error, phase);
    }
  };

  const approve = async (approval: {
    isApproved: boolean;
    question: string;
    code: CliErrorCode;
    message: string;
    hint: string;
  }) => {
    await flushProgress?.().catch((error: unknown) => {
      throw fail(error, 'confirmation');
    });
    return requireApproval({
      ...approval,
      canPrompt,
      declinedMessage: 'Apply stopped at the confirmation prompt.',
      signal: approvalSignal ?? signal,
    })
      .then(() => approvalSignal?.throwIfAborted())
      .catch((error: unknown) => {
        throw fail(error, 'confirmation');
      });
  };

  const preview = () =>
    fetchAppPlan({ build, inferDeletionFromMissingEntities, target, signal });

  const previewOrBootstrap = async () => {
    try {
      const actions = await preview();

      completedPhases.push('preview');

      return { actions, isRegistrationCreated: false };
    } catch (error) {
      if (!isPlanUnavailable(error)) {
        throw fail(error, 'preview');
      }
    }

    await approve({
      isApproved: isCreationApproved,
      question: `${application.displayName} is not registered. Register it and install it on ${target.apiUrl}?`,
      code: 'CREATE_REQUIRED',
      message: `${application.displayName} has no registration yet. Applying it would create one.`,
      hint: 'Run twenty app apply --create to register it and install it in this workspace.',
    });

    output.progress('Registering the app…');
    await runPhase('registration', () =>
      registerApp({ application, target, signal }),
    );
    output.progress('Installing the development app…');
    await runPhase('installation', () =>
      installDevelopmentApp({ application, target, signal }),
    );
    output.progress('Computing metadata plan…');

    return {
      actions: await runPhase('preview', preview),
      isRegistrationCreated: true,
    };
  };

  const snapshotDirectory = resolveSnapshotDirectory({
    build,
    appPath,
  });

  output.progress(`Computing metadata plan on ${target.apiUrl}…`);

  const { actions, isRegistrationCreated } = await previewOrBootstrap();
  const summary = getAppPlanSummary(actions);

  if (outputMode === 'human') {
    output.progress(
      formatAppPlanActions({
        actions,
        summary,
        inferDeletionFromMissingEntities,
        stream: process.stderr,
      }),
    );
  }

  if (summary.destructive > 0) {
    const deletionLabel =
      summary.destructive === 1
        ? 'object or field deletion that permanently deletes'
        : 'object or field deletions that permanently delete';

    await approve({
      isApproved: isDeletionApproved,
      question: `Apply ${summary.destructive} ${deletionLabel} stored data on ${target.apiUrl}?`,
      code: 'CONFIRMATION_REQUIRED',
      message: `The plan includes ${summary.destructive} ${deletionLabel} stored data.`,
      hint: 'Review it with twenty app plan, then pass --yes to apply it, or --no-delete to keep entities missing from source.',
    });
  }

  if (!isRegistrationCreated) {
    await runPhase('installation', () =>
      installDevelopmentApp({ application, target, signal }),
    );
  }

  output.progress('Checking files…');
  await runPhase('upload', () =>
    uploadAppFiles({
      build,
      snapshotDirectory,
      target,
      signal,
      progress: upload,
      onFilesToUpload: (count) =>
        output.progress(
          count === 0
            ? 'Files already up to date.'
            : `Uploading ${count} ${count === 1 ? 'file' : 'files'}…`,
        ),
    }),
  );
  output.progress('Synchronizing the app…');

  const { actions: appliedActions, acknowledgedUniversalIdentifier } =
    await runPhase('sync', () =>
      syncAppManifest({
        build,
        inferDeletionFromMissingEntities,
        target,
        signal,
      }),
    );

  return {
    completedPhases,
    isRegistrationCreated,
    appliedActions,
    acknowledgedUniversalIdentifier,
    upload,
  };
};
