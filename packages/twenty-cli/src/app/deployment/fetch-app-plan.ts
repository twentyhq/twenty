import { isPlainObject } from 'twenty-shared/utils';

import { isApplicationNotFoundError } from '@/app/is-application-not-found-error';
import { parseAppPlan } from '@/app/deployment/parse-app-plan';
import { type ToolingBuild } from '@/app/types/tooling-result.type';
import { CliError } from '@/output/cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

export const fetchAppPlan = async ({
  build,
  inferDeletionFromMissingEntities,
  target,
  signal,
}: {
  build: ToolingBuild;
  inferDeletionFromMissingEntities: boolean;
  target: ResolvedTarget;
  signal: AbortSignal;
}) => {
  if (
    build.manifestFormat !== 'twenty-application' ||
    !isPlainObject(build.manifest.application) ||
    build.manifest.application.universalIdentifier !==
      build.application.universalIdentifier
  ) {
    throw new CliError({
      code: 'TOOLING_UNSUPPORTED',
      message: 'The app build produced a manifest that this CLI cannot plan.',
    });
  }

  try {
    const data = await createMetadataClient({ target, signal }).mutation({
      __name: 'PreviewApplication',
      syncApplication: {
        __args: {
          manifest: build.manifest,
          dryRun: true,
          inferDeletionFromMissingEntities,
        },
        applicationUniversalIdentifier: true,
        actions: true,
      },
    });

    return parseAppPlan({
      value: data?.syncApplication,
      applicationUniversalIdentifier: build.application.universalIdentifier,
    });
  } catch (error) {
    if (
      error instanceof CliError &&
      isApplicationNotFoundError({ error, field: 'syncApplication' })
    ) {
      throw new CliError({
        code: 'PLAN_UNAVAILABLE',
        message:
          'This app must be registered in this workspace before its changes can be planned. Nothing was registered, uploaded or synchronized.',
        hint: 'Run twenty app apply --create to register it and install it in this workspace.',
        details: {
          ...error.details,
          body: undefined,
          data: null,
          applicationUniversalIdentifier: build.application.universalIdentifier,
          plan: true,
        },
      });
    }

    if (error instanceof CliError && isPlainObject(error.details)) {
      throw new CliError({
        code: error.code,
        exitCode: error.exitCode,
        message: error.message,
        hint: error.hint,
        details: { ...error.details, body: undefined, data: null },
      });
    }

    throw error;
  }
};
