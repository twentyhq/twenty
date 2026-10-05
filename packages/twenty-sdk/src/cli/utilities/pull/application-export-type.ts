import { type Manifest } from 'twenty-shared/application';

export const APPLICATION_EXPORT_COVERAGE_STATUSES = [
  'EXPORTED',
  'ENGINE_DERIVED',
  'EXCLUDED',
  'UNSUPPORTED',
  'FOREIGN_OWNED',
] as const;

export type ApplicationExportCoverageStatus =
  (typeof APPLICATION_EXPORT_COVERAGE_STATUSES)[number];

export type ApplicationExportCoverageEntry = {
  metadataName: string;
  universalIdentifier: string;
  status: ApplicationExportCoverageStatus;
  reason: string | null;
};

export type ApplicationExportFile = {
  folder: string;
  path: string;
  content: string;
};

export type ApplicationExport = {
  application: {
    universalIdentifier: string;
    displayName: string;
    sourceType: string;
  };
  manifest: Manifest;
  coverage: ApplicationExportCoverageEntry[];
  files: ApplicationExportFile[];
};
