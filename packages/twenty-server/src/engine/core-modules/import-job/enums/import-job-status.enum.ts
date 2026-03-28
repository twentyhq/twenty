import { registerEnumType } from '@nestjs/graphql';

export enum ImportJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

registerEnumType(ImportJobStatus, {
  name: 'ImportJobStatus',
});
