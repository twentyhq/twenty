import { isArray, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type ToolingBuild } from '@/app/types/tooling-result.type';
import { CliError } from '@/output/cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

const isTranslationReportingUnsupported = (error: unknown) => {
  if (!(error instanceof CliError) || error.code !== 'GRAPHQL_ERROR') {
    return false;
  }
  const errors = error.details?.errors;
  return (
    isArray(errors) &&
    errors.length > 0 &&
    errors.every(
      (entry: unknown) =>
        isPlainObject(entry) &&
        (!isDefined(entry.code) ||
          entry.code === 'GRAPHQL_VALIDATION_FAILED') &&
        isString(entry.message) &&
        entry.message.includes(
          'Cannot query field "translationActions" on type "WorkspaceMigration"',
        ),
    )
  );
};

export const requestAppSync = async ({
  build,
  inferDeletionFromMissingEntities,
  target,
  signal,
  dryRun = false,
}: {
  build: ToolingBuild;
  inferDeletionFromMissingEntities: boolean;
  target: ResolvedTarget;
  signal: AbortSignal;
  dryRun?: boolean;
}) => {
  const client = createMetadataClient({ target, signal });
  const request = (includeTranslations: boolean) =>
    client.mutation({
      __name: dryRun ? 'PreviewApplication' : 'SyncApplication',
      syncApplication: {
        __args: {
          manifest: build.manifest,
          inferDeletionFromMissingEntities,
          ...(dryRun ? { dryRun: true } : {}),
        },
        applicationUniversalIdentifier: true,
        actions: true,
        ...(includeTranslations ? { translationActions: true } : {}),
      },
    });

  try {
    return await request(true);
  } catch (error) {
    if (!isTranslationReportingUnsupported(error)) {
      throw error;
    }
    // GraphQL validation runs before execution, so this retry cannot duplicate writes.
    return request(false);
  }
};
