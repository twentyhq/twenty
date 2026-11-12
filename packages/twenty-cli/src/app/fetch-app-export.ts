import { isArray, isNull, isString } from '@sniptt/guards';
import {
  isNonEmptyArray,
  isPlainObject,
  typedObjectEntries,
} from 'twenty-shared/utils';

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

const isValidationErrorEntry = (
  entry: unknown,
  status: unknown,
): entry is Record<string, unknown> =>
  isPlainObject(entry) &&
  (entry.code === 'GRAPHQL_VALIDATION_FAILED' ||
    (isNull(entry.code) && status === 400)) &&
  isNull(entry.path);

const isExportValidationError = ({
  error,
  messagePrefix,
}: {
  error: unknown;
  messagePrefix: string;
}): boolean => {
  if (!(error instanceof CliError) || error.code !== 'GRAPHQL_ERROR') {
    return false;
  }

  const errors = error.details?.errors;

  if (!isArray(errors) || errors.length !== 1) {
    return false;
  }

  const entry: unknown = errors[0];

  return (
    isValidationErrorEntry(entry, error.details?.status) &&
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
  shouldIncludePublicAssets = false,
}: {
  universalIdentifier: string;
  target: ResolvedTarget;
  signal: AbortSignal;
  shouldIncludeDependencies?: boolean;
  shouldIncludeSourceFiles?: boolean;
  shouldIncludePublicAssets?: boolean;
}): Promise<AppExport> => {
  const client = createMetadataClient({ target, signal });
  const fileOptions = { shouldIncludeSourceFiles, shouldIncludePublicAssets };
  const fileOptionKeys = typedObjectEntries(fileOptions).map(([key]) => key);
  const query = () =>
    client.query({
      __name: 'ExportApplication',
      exportApplication: {
        __args: {
          universalIdentifier,
          ...Object.fromEntries(
            Object.entries(fileOptions).filter(([, enabled]) => enabled),
          ),
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
  try {
    const queryWithFallback = async (): ReturnType<typeof query> => {
      try {
        return await query();
      } catch (error) {
        if (!(error instanceof CliError) || error.code !== 'GRAPHQL_ERROR') {
          throw error;
        }
        const errors = error.details?.errors;
        const unsupportedOptions = new Set<keyof typeof fileOptions>();
        if (
          !isArray(errors) ||
          !isNonEmptyArray(errors) ||
          !errors.every((entry: unknown) => {
            if (!isValidationErrorEntry(entry, error.details?.status)) {
              return false;
            }
            const message = entry.message;
            const option = fileOptionKeys.find(
              (key) =>
                fileOptions[key] &&
                isString(message) &&
                message.startsWith(
                  `Unknown argument "${key}" on field "Query.exportApplication".`,
                ),
            );
            if (!option) {
              return false;
            }
            unsupportedOptions.add(option);
            return true;
          })
        ) {
          throw error;
        }
        for (const option of unsupportedOptions) {
          fileOptions[option] = false;
        }
        return queryWithFallback();
      }
    };
    const data = await queryWithFallback();
    return parseAppExport({
      value: data?.exportApplication,
      universalIdentifier,
    });
  } catch (error) {
    if (isApplicationNotFoundError({ error, field: 'exportApplication' })) {
      throw createAppNotInstalledError({
        universalIdentifier,
        apiUrl: target.apiUrl,
      });
    }

    if (
      isExportValidationError({
        error,
        messagePrefix:
          'Cannot query field "exportApplication" on type "Query".',
      })
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
  }
};
