import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type CalendarEventComposerTarget = {
  objectMetadataId: string;
  recordId: string;
  record: ObjectRecord;
};
