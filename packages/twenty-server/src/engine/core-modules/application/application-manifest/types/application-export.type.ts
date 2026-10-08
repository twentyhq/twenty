import { type Manifest } from 'twenty-shared/application';
import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';

export type ApplicationExportCoverageEntry = {
  metadataName: AllMetadataName;
  universalIdentifier: string;
  status: ApplicationExportCoverageStatus;
  reason?: string;
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
    sourceType: ApplicationRegistrationSourceType;
  };
  manifest: Manifest;
  coverage: ApplicationExportCoverageEntry[];
  files: ApplicationExportFile[];
};
