import { type ObjectRecord } from 'twenty-shared/types';

export type ObjectRecordOperationUpdateInput = {
  recordId: string;
  updatedFields: Record<string, unknown>[];
  updatedRecord?: ObjectRecord;
};
