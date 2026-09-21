import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationExportCoverageStatus {
  EXPORTED = 'EXPORTED',
  ENGINE_DERIVED = 'ENGINE_DERIVED',
  EXCLUDED = 'EXCLUDED',
  UNSUPPORTED = 'UNSUPPORTED',
  FOREIGN_OWNED = 'FOREIGN_OWNED',
}

registerEnumType(ApplicationExportCoverageStatus, {
  name: 'ApplicationExportCoverageStatus',
});
