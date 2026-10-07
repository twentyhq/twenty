import { type ExportedManifest } from '@/app/types/exported-manifest.type';

export type AppExportCoverageEntry = {
  metadataName: string;
  universalIdentifier: string;
  status: string;
  reason: string | null;
};

export type AppExportFile = {
  folder: string;
  path: string;
  content: string;
};

export type AppExport = {
  application: {
    universalIdentifier: string;
    displayName: string;
    sourceType: string;
  };
  manifest: ExportedManifest;
  coverage: AppExportCoverageEntry[];
  files: AppExportFile[];
};
