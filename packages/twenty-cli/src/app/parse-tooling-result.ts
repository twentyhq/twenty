import { isArray, isNull, isNumber, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import {
  type ToolingArtifact,
  type ToolingBuild,
  type ToolingDiagnostic,
  type ToolingResult,
} from '@/app/types/tooling-result.type';
import { CliError } from '@/output/cli-error';

const isOptionalString = (value: unknown) =>
  !isDefined(value) || isString(value);

const isOptionalNumber = (value: unknown) =>
  !isDefined(value) || isNumber(value);

export const isToolingDiagnostic = (
  value: unknown,
): value is ToolingDiagnostic =>
  isPlainObject(value) &&
  (value.severity === 'error' || value.severity === 'warning') &&
  isString(value.code) &&
  isString(value.message) &&
  isOptionalString(value.file) &&
  isOptionalNumber(value.line) &&
  isOptionalNumber(value.column);

const isToolingArtifact = (value: unknown): value is ToolingArtifact =>
  isPlainObject(value) &&
  isString(value.path) &&
  isString(value.role) &&
  isString(value.sourcePath) &&
  isNumber(value.size) &&
  isString(value.sha256);

const createInvalidResultError = () =>
  new CliError({
    code: 'WORKER_FAILED',
    message: 'The app worker returned a result this CLI cannot read.',
    hint: 'Check that the app and the CLI use compatible versions.',
  });

export const parseBuildData = (
  value: unknown,
): { data: ToolingBuild } | undefined => {
  if (
    !isPlainObject(value) ||
    !isString(value.buildId) ||
    !isOptionalString(value.directory) ||
    !isString(value.contentHash) ||
    !isPlainObject(value.application) ||
    !isString(value.application.universalIdentifier) ||
    !isString(value.application.name) ||
    !isString(value.application.displayName) ||
    !isString(value.manifestFormat) ||
    !isPlainObject(value.manifest) ||
    !isArray(value.files) ||
    !value.files.every(isToolingArtifact)
  ) {
    return undefined;
  }

  return {
    data: {
      buildId: value.buildId,
      ...(isString(value.directory) ? { directory: value.directory } : {}),
      contentHash: value.contentHash,
      application: {
        universalIdentifier: value.application.universalIdentifier,
        name: value.application.name,
        displayName: value.application.displayName,
      },
      manifestFormat: value.manifestFormat,
      manifest: value.manifest,
      files: value.files,
    },
  };
};

export const parseNullData = (value: unknown): { data: null } | undefined =>
  isNull(value) ? { data: null } : undefined;

export const parseToolingResult = <TData>({
  value,
  parseData,
}: {
  value: unknown;
  parseData: (data: unknown) => { data: TData } | undefined;
}): ToolingResult<TData> => {
  if (
    !isPlainObject(value) ||
    !isArray(value.diagnostics) ||
    !value.diagnostics.every(isToolingDiagnostic)
  ) {
    throw createInvalidResultError();
  }

  const diagnostics = value.diagnostics;

  if (value.success === true) {
    const parsed = parseData(value.data);

    if (!isDefined(parsed)) {
      throw createInvalidResultError();
    }

    return { success: true, data: parsed.data, diagnostics };
  }

  if (
    value.success === false &&
    isPlainObject(value.error) &&
    isString(value.error.code) &&
    isString(value.error.message)
  ) {
    return {
      success: false,
      error: {
        code: value.error.code,
        message: value.error.message,
        ...(isString(value.error.hint) ? { hint: value.error.hint } : {}),
        ...(isPlainObject(value.error.details)
          ? { details: value.error.details }
          : {}),
      },
      diagnostics,
    };
  }

  throw createInvalidResultError();
};
