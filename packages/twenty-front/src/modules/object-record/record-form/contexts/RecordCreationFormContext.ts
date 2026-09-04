import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createContext } from 'react';

export type RecordCreationFormContextValue = {
  requestRecordCreationDraft: (params: {
    objectMetadataItem: EnrichedObjectMetadataItem;
    initialDraftRecord?: Partial<ObjectRecord>;
  }) => Promise<Partial<ObjectRecord> | null>;
};

export const RecordCreationFormContext =
  createContext<RecordCreationFormContextValue | null>(null);
