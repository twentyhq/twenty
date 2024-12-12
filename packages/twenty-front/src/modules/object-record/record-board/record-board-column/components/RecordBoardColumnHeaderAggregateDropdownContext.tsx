import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AggregateContentId } from '@/object-record/record-board/types/AggregateContentId';
import { createContext } from 'react';

export type RecordBoardColumnHeaderAggregateDropdownContextValue = {
  objectMetadataItem: ObjectMetadataItem;
  currentContentId: AggregateContentId | null;
  onContentChange: (key: AggregateContentId) => void;
  resetContent: () => void;
  dropdownId: string;
};

export const RecordBoardColumnHeaderAggregateDropdownContext =
  createContext<RecordBoardColumnHeaderAggregateDropdownContextValue>(
    {} as RecordBoardColumnHeaderAggregateDropdownContextValue,
  );
