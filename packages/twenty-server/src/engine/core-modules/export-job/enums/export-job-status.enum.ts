import { registerEnumType } from '@nestjs/graphql';

export enum ExportJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

registerEnumType(ExportJobStatus, {
  name: 'ExportJobStatus',
});
