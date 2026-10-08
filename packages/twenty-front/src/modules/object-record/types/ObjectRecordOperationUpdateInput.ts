import { type ObjectRecord } from 'twenty-shared/types';

export type ObjectRecordOperationUpdateInput = {
  recordId: string;
  updatedFields: Record<string, unknown>[];
  // Only server events carry the whole row
  updatedRecord?: ObjectRecord;
};
