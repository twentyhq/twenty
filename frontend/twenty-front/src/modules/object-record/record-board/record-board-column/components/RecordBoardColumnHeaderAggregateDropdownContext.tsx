import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordBoardColumnHeaderAggregateContentId } from '@/object-record/record-board/types/RecordBoardColumnHeaderAggregateContentId';
import { createContext } from 'react';

export type RecordBoardColumnHeaderAggregateDropdownContextValue = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  currentContentId: RecordBoardColumnHeaderAggregateContentId | null;
  onContentChange: (key: RecordBoardColumnHeaderAggregateContentId) => void;
  resetContent: () => void;
  previousContentId: RecordBoardColumnHeaderAggregateContentId | null;
  dropdownId: string;
};

export const RecordBoardColumnHeaderAggregateDropdownContext =
  createContext<RecordBoardColumnHeaderAggregateDropdownContextValue>(
    {} as RecordBoardColumnHeaderAggregateDropdownContextValue,
  );
