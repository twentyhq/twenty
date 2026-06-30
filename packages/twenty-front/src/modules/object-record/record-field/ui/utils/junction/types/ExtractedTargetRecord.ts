import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type ExtractedTargetRecord = {
  recordId: string;
  objectMetadataId: string;
  record?: ObjectRecord;
};
