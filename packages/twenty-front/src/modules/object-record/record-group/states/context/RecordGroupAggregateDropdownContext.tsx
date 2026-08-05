import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGroupAggregateContentId } from '@/object-record/record-group/types/RecordGroupAggregateContentId';
import { createContext } from 'react';

export type RecordGroupAggregateDropdownContextValue = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  currentContentId: RecordGroupAggregateContentId | null;
  onContentChange: (key: RecordGroupAggregateContentId) => void;
  resetContent: () => void;
  previousContentId: RecordGroupAggregateContentId | null;
  dropdownId: string;
};

export const RecordGroupAggregateDropdownContext =
  createContext<RecordGroupAggregateDropdownContextValue>(
    {} as RecordGroupAggregateDropdownContextValue,
  );
