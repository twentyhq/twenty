import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type RecordCreationRequest = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  initialDraftRecord?: Partial<ObjectRecord>;
  canCreateAnother?: boolean;
  createRecord: (draftRecord: Partial<ObjectRecord>) => Promise<ObjectRecord>;
};
