import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import { join } from 'node:path';

import { isDefined } from 'twenty-shared/utils';

import { type AppApplyResult } from '@/app/deployment/apply-app-build';
import { createPostSyncFailure } from '@/app/deployment/create-post-sync-failure';
import { readWatchInputStamp } from '@/app/dev/read-watch-input-stamp';
import { type BuiltDevSnapshot } from '@/app/dev/build-dev-snapshot';
import {
  fetchAppClientSchema,
  generateAppClientFromSchema,
} from '@/app/generate-app-client';
import { getClientGenerationSkipReason } from '@/app/get-client-generation-skip-reason';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { withPhaseDetails } from '@/app/deployment/with-phase-details';
import { toCliError } from '@/output/to-cli-error';

export const createDevClientGenerator = ({ appPath }: { appPath: string }) => {
  let generatedKey: string | undefined;
  let generatedOutputStamp: string | undefined;
  const readGeneratedOutputStamp = () =>
    JSON.stringify(
      [
        'dist/core.mjs',
        'dist/core.cjs',
        'dist/core/generated',
        'dist/core/generated/index.d.ts',
      ].map((path) =>
        readWatchInputStamp({
          path: join(appPath, 'node_modules', 'twenty-client-sdk', path),
          kind: 'file',
        }),
      ),
    );

  return async ({
    snapshot,
    applied,
    context,
    withBuildsPaused,
    invalidate,
  }: {
    snapshot: BuiltDevSnapshot;
    applied: AppApplyResult;
    context: TargetCommandContext;
    withBuildsPaused: <TResult>(
      run: () => Promise<TResult>,
    ) => Promise<TResult>;
    invalidate: () => void;
  }) => {
    const skipReason = await getClientGenerationSkipReason({
      appPath,
    });

    if (isDefined(skipReason)) {
      context.output.warn({
        code: 'CLIENT_NOT_GENERATED',
        message: skipReason,
      });

      return 'skipped';
    }

    let schema: string;
    let generationKey: string;

    try {
      schema = await fetchAppClientSchema({
        applicationUniversalIdentifier: applied.acknowledgedUniversalIdentifier,
        context,
      });
      const packageRoot = await realpath(
        join(appPath, 'node_modules', 'twenty-client-sdk'),
      );
      const packageJson = await readFile(join(packageRoot, 'package.json'));

      generationKey = createHash('sha256')
        .update(schema)
        .update(packageRoot)
        .update(packageJson)
        .digest('hex');
    } catch (error) {
      if (context.signal.aborted) {
        throw withPhaseDetails({
          error: toCliError(error, context.signal),
          phase: 'clientGeneration',
          outcome: 'applied',
          completedPhases: applied.completedPhases,
          hint: 'The app was synced. Client generation had not started, so the previous typed API client was kept.',
        });
      }

      context.output.warn({
        code: 'CLIENT_NOT_GENERATED',
        message: `The app was synced, but its client inputs could not be fetched: ${toCliError(error).message} The previous client was kept.`,
      });

      return 'skipped';
    }

    if (
      generationKey === generatedKey &&
      readGeneratedOutputStamp() === generatedOutputStamp
    ) {
      return 'unchanged';
    }

    let hasStartedGeneration = false;

    try {
      await withBuildsPaused(async () => {
        context.signal.throwIfAborted();
        hasStartedGeneration = true;
        await generateAppClientFromSchema({
          appPath,
          schema,
          sdk: snapshot.tooling,
          context,
        });
        generatedKey = generationKey;
        generatedOutputStamp = readGeneratedOutputStamp();
        applied.completedPhases.push('clientGeneration');
        invalidate();
      });
    } catch (error) {
      if (!hasStartedGeneration) {
        throw withPhaseDetails({
          error: toCliError(error, context.signal),
          phase: 'clientGeneration',
          outcome: 'applied',
          completedPhases: applied.completedPhases,
          hint: 'The app was synced. Client generation had not started, so the previous typed API client was kept.',
        });
      }

      throw createPostSyncFailure({
        error,
        phase: 'clientGeneration',
        applicationName: snapshot.build.application.displayName,
        apiUrl: context.target.apiUrl,
        completedPhases: applied.completedPhases,
        signal: context.signal,
      });
    }

    return 'generated';
  };
};
