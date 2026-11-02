import { isArray, isNull, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { createAppNotInstalledError } from '@/app/create-app-not-installed-error';
import { isApplicationNotFoundError } from '@/app/is-application-not-found-error';
import { parseAppExport } from '@/app/parse-app-export';
import { type AppExport } from '@/app/types/app-export.type';
import { CliError } from '@/output/cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

const NOT_EXPORTABLE_SUB_CODES = new Set([
  'APPLICATION_NOT_EXPORTABLE',
  'STANDARD_APPLICATION_NOT_EXPORTABLE',
]);

const isExportValidationError = (
  error: unknown,
  messagePrefix: string,
): error is CliError => {
  if (!(error instanceof CliError) || error.code !== 'GRAPHQL_ERROR') {
    return false;
  }

  const errors = error.details?.errors;

  if (!isArray(errors) || errors.length !== 1) {
    return false;
  }

  const entry: unknown = errors[0];

  return (
    isPlainObject(entry) &&
    (entry.code === 'GRAPHQL_VALIDATION_FAILED' ||
      (isNull(entry.code) && error.details?.status === 400)) &&
    isNull(entry.path) &&
    isString(entry.message) &&
    entry.message.startsWith(messagePrefix)
  );
};

const isNotExportableError = (error: unknown): error is CliError => {
  if (!(error instanceof CliError) || error.code !== 'GRAPHQL_ERROR') {
    return false;
  }

  const errors = error.details?.errors;

  if (!isArray(errors) || errors.length !== 1) {
    return false;
  }

  const entry: unknown = errors[0];

  return (
    isPlainObject(entry) &&
    isString(entry.subCode) &&
    NOT_EXPORTABLE_SUB_CODES.has(entry.subCode)
  );
};

export const fetchAppExport = async ({
  universalIdentifier,
  target,
  signal,
  shouldIncludeDependencies = false,
  shouldIncludeSourceFiles = false,
}: {
  universalIdentifier: string;
  target: ResolvedTarget;
  signal: AbortSignal;
  shouldIncludeDependencies?: boolean;
  shouldIncludeSourceFiles?: boolean;
}): Promise<AppExport> => {
  const client = createMetadataClient({ target, signal });
  const query = (includeSourceFiles: boolean) =>
    client.query({
      __name: 'ExportApplication',
      exportApplication: {
        __args: {
          universalIdentifier,
          ...(includeSourceFiles ? { shouldIncludeSourceFiles: true } : {}),
          ...(shouldIncludeDependencies
            ? { shouldIncludeDependencies: true }
            : {}),
        },
        application: {
          universalIdentifier: true,
          displayName: true,
          sourceType: true,
        },
        manifest: true,
        coverage: {
          metadataName: true,
          universalIdentifier: true,
          status: true,
          reason: true,
        },
        files: { folder: true, path: true, content: true },
      },
    });
  const data = await query(shouldIncludeSourceFiles)
    .catch((error: unknown) => {
      if (
        shouldIncludeSourceFiles &&
        isExportValidationError(
          error,
          'Unknown argument "shouldIncludeSourceFiles" on field "Query.exportApplication".',
        )
      ) {
        return query(false);
      }
      throw error;
    })
    .catch((error: unknown) => {
      if (isApplicationNotFoundError({ error, field: 'exportApplication' })) {
        throw createAppNotInstalledError({
          universalIdentifier,
          apiUrl: target.apiUrl,
        });
      }

      if (
        isExportValidationError(
          error,
          'Cannot query field "exportApplication" on type "Query".',
        )
      ) {
        throw new CliError({
          code: 'APP_EXPORT_UNSUPPORTED',
          message: 'This server does not support application export.',
        });
      }

      if (isNotExportableError(error)) {
        throw new CliError({
          code: 'APP_NOT_EXPORTABLE',
          message: error.message,
          hint: 'Only apps developed locally can be pulled: not the standard app, and not apps installed from a package.',
          details: { universalIdentifier },
        });
      }

      throw error;
    });
  return parseAppExport({
    value: data?.exportApplication,
    universalIdentifier,
  });
};
