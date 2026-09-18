import { registerEnumType } from '@nestjs/graphql';

export enum RecordExportStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

registerEnumType(RecordExportStatus, { name: 'RecordExportStatus' });
