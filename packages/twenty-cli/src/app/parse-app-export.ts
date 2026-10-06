import { isArray, isNull, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';
import { isSameUniversalIdentifier } from '@/app/is-same-universal-identifier';
import { isExportedManifest } from '@/app/pull/is-exported-manifest';
import {
  type AppExport,
  type AppExportCoverageEntry,
} from '@/app/types/app-export.type';
import { CliError } from '@/output/cli-error';

const isCoverageEntry = (value: unknown): value is AppExportCoverageEntry =>
  isPlainObject(value) &&
  isString(value.metadataName) &&
  isString(value.universalIdentifier) &&
  isString(value.status) &&
  (isString(value.reason) || isNull(value.reason));

export const parseAppExport = ({
  value,
  universalIdentifier,
}: {
  value: unknown;
  universalIdentifier: string;
}): AppExport => {
  const applicationExport = value;

  if (
    !isPlainObject(applicationExport) ||
    !isPlainObject(applicationExport.application) ||
    !isString(applicationExport.application.universalIdentifier) ||
    !isSameUniversalIdentifier({
      value: applicationExport.application.universalIdentifier,
      universalIdentifier,
    }) ||
    !isString(applicationExport.application.displayName) ||
    !isString(applicationExport.application.sourceType) ||
    !isExportedManifest(applicationExport.manifest) ||
    !isSameUniversalIdentifier({
      value: applicationExport.manifest.application.universalIdentifier,
      universalIdentifier,
    }) ||
    !isArray(applicationExport.coverage) ||
    !applicationExport.coverage.every(isCoverageEntry) ||
    !isArray(applicationExport.files)
  ) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: `The server returned an export of ${universalIdentifier} that this CLI cannot read.`,
    });
  }

  if (applicationExport.files.length > 0) {
    throw new CliError({
      code: 'TOOLING_UNSUPPORTED',
      message:
        'The application export contains source or dependency files that this CLI cannot reconcile. No local files were changed.',
      hint: 'Use a CLI version that supports this export format.',
    });
  }

  return {
    application: {
      universalIdentifier: applicationExport.application.universalIdentifier,
      displayName: applicationExport.application.displayName,
      sourceType: applicationExport.application.sourceType,
    },
    manifest: applicationExport.manifest,
    coverage: applicationExport.coverage,
    files: [],
  };
};
