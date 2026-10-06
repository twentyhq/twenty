import { isDefined } from 'twenty-shared/utils';

import { applyAppBuild } from '@/app/deployment/apply-app-build';
import { createPostSyncFailure } from '@/app/deployment/create-post-sync-failure';
import {
  buildDevSnapshot,
  type BuiltDevSnapshot,
} from '@/app/dev/build-dev-snapshot';
import { createDevClientGenerator } from '@/app/dev/generate-dev-client';
import { createDevOutput } from '@/app/dev/create-dev-output';
import { runDevLoop } from '@/app/dev/run-dev-loop';
import { watchAppInputs } from '@/app/dev/watch-app-inputs';
import { isToolingDiagnostic } from '@/app/parse-tooling-result';
import { formatToolingDiagnostic } from '@/app/format-tooling-diagnostic';
import { recordPullBase } from '@/app/record-pull-base';
import { resolveAppProject } from '@/app/project/resolve-app-project';
import {
  readBooleanOption,
  readStringOption,
} from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { CliError } from '@/output/cli-error';
import { toCliError } from '@/output/to-cli-error';

export const runAppDevCommand: CommandRun<TargetCommandContext> = async (
  context,
) => {
  const project = await resolveAppProject({
    explicitPath: readStringOption(context.options, 'path'),
    workingDirectory: process.cwd(),
  });
  const { output, emit } = createDevOutput(context);
  const generateClient = createDevClientGenerator({ appPath: project.path });
  let watcher: Awaited<ReturnType<typeof watchAppInputs>>;

  await runDevLoop<BuiltDevSnapshot>({
    signal: context.signal,
    subscribe: async (invalidate, fail) => {
      watcher = await watchAppInputs({
        appPath: project.path,
        signal: context.signal,
        onChange: invalidate,
        onError: fail,
      });
      try {
        await emit(
          {
            kind: 'watch-ready',
            message: `Watching ${project.path}. Syncing to ${context.target.apiUrl}. Press Ctrl+C to stop.`,
            appPath: project.path,
          },
          context.signal,
        );
      } catch (error) {
        await watcher.close();

        throw error;
      }

      return watcher.close;
    },
    build: async (revision, signal) => {
      await emit(
        {
          kind: 'build-start',
          message: 'Building app…',
          revision,
        },
        signal,
      );

      try {
        const snapshot = await buildDevSnapshot({
          appPath: project.path,
          signal,
          updateWatchInputs: watcher.update,
        });

        try {
          await emit(
            {
              kind: 'build-success',
              message: `Built ${snapshot.build.application.displayName}.`,
              revision,
              buildId: snapshot.build.buildId,
              contentHash: snapshot.contentHash,
              diagnostics: snapshot.diagnostics,
            },
            signal,
          );

          return snapshot;
        } catch (error) {
          await snapshot.release();

          throw error;
        }
      } catch (error) {
        signal.throwIfAborted();
        const failure = toCliError(error);

        if (failure.code === 'WORKER_FAILED') {
          throw new CliError({
            code: failure.code,
            message: failure.message,
            details: failure.details,
            hint: 'Fix the worker failure, then restart twenty app dev. A worker killed while building may leave folders in .twenty/cli/snapshots; remove abandoned snapshots only after stopping all dev/apply sessions for this app.',
          });
        }

        if (
          ![
            'TYPECHECK_FAILED',
            'BUILD_FAILED',
            'SDK_NOT_INSTALLED',
            'SDK_SOURCE_UNSUPPORTED',
            'TYPESCRIPT_NOT_INSTALLED',
          ].includes(failure.code)
        ) {
          throw error;
        }

        const diagnostics = failure.details?.diagnostics;

        if (context.outputMode === 'human' && Array.isArray(diagnostics)) {
          for (const diagnostic of diagnostics.filter(isToolingDiagnostic)) {
            output.progress(formatToolingDiagnostic(diagnostic));
          }
        }

        await emit(
          {
            kind: 'build-failure',
            message: `${failure.message} Waiting for source changes.`,
            revision,
            error: {
              code: failure.code,
              message: failure.message,
              details: failure.details,
            },
          },
          signal,
        );

        return undefined;
      }
    },
    apply: async (snapshot, controls) => {
      const { revision, signal } = controls;
      const currentContext = { ...context, output, signal };
      let hasStartedWriting = false;

      await emit(
        {
          kind: 'sync-start',
          message: 'Planning changes…',
          revision,
          buildId: snapshot.build.buildId,
        },
        signal,
      );

      let applied;

      try {
        applied = await applyAppBuild({
          build: snapshot.build,
          appPath: project.path,
          context: currentContext,
          inferDeletionFromMissingEntities: context.options.delete !== false,
          isCreationApproved: readBooleanOption(context.options, 'create'),
          isDeletionApproved: readBooleanOption(context.options, 'yes'),
          approvalSignal: controls.revisionSignal,
          flushProgress: () =>
            emit({ kind: 'sync-progress', message: '', revision }, signal),
          beforeWrite: () => {
            if (!hasStartedWriting) controls.revisionSignal.throwIfAborted();
            hasStartedWriting = true;
          },
        });
      } catch (error) {
        if (signal.aborted) throw error;
        const failure = toCliError(error);

        if (
          controls.revisionSignal.aborted &&
          failure.details?.phase === 'confirmation'
        ) {
          await emit(
            {
              kind: 'sync-superseded',
              message: 'Source changed; a fresh plan is queued.',
              revision,
              details: failure.details,
            },
            signal,
          );

          return false;
        }

        if (['AUTH_REQUIRED', 'PERMISSION_DENIED'].includes(failure.code))
          throw error;

        await emit(
          {
            kind: 'sync-failure',
            message: `${failure.message} A new source edit will request a fresh plan.`,
            revision,
            error: {
              code: failure.code,
              message: failure.message,
              hint: failure.hint,
              details: failure.details,
            },
          },
          signal,
        );

        return false;
      }

      try {
        const pullBase = await recordPullBase({
          appPath: project.path,
          universalIdentifier: applied.acknowledgedUniversalIdentifier,
          sourceFingerprints: snapshot.sourceFingerprints,
          context: currentContext,
        });

        if (pullBase === 'recorded') applied.completedPhases.push('pullBase');
      } catch (error) {
        throw createPostSyncFailure({
          error,
          phase: 'pullBase',
          applicationName: snapshot.build.application.displayName,
          apiUrl: context.target.apiUrl,
          completedPhases: applied.completedPhases,
          signal,
        });
      }

      const clientGeneration = await generateClient({
        snapshot,
        applied,
        context: currentContext,
        withBuildsPaused: controls.withBuildsPaused,
        invalidate: controls.invalidate,
      });

      if (!isDefined(applied.appliedActions))
        output.warn({
          code: 'SYNC_REPORT_UNAVAILABLE',
          message:
            'The sync succeeded, but the server did not return a readable list of changes.',
        });

      await emit(
        {
          kind: 'sync-success',
          message: `Synced ${snapshot.build.application.displayName}. Watching for changes…`,
          revision,
          buildId: snapshot.build.buildId,
          contentHash: snapshot.contentHash,
          completedPhases: applied.completedPhases,
          clientGeneration,
          actions: applied.appliedActions ?? null,
        },
        signal,
      );

      return true;
    },
    onSkipped: (revision, reason) =>
      emit(
        {
          kind: 'build-skipped',
          message:
            reason === 'unchanged'
              ? 'Build unchanged since the last acknowledged sync.'
              : 'Source changed during the build; rebuilding…',
          revision,
          reason,
        },
        context.signal,
      ),
  });

  throw new CliError({
    code: 'INTERNAL_ERROR',
    message: 'The dev session stopped unexpectedly.',
  });
};
