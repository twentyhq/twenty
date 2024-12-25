import { RecordTableFooterAggregateContentId } from '@/object-record/record-table/record-table-footer/types/RecordTableFooterAggregateContentId';
import { createContext } from 'react';

export type RecordTableColumnAggregateFooterDropdownContextValue = {
  currentContentId: RecordTableFooterAggregateContentId | null;
  onContentChange: (key: RecordTableFooterAggregateContentId) => void;
  resetContent: () => void;
  dropdownId: string;
  fieldMetadataId: string;
};

export const RecordTableColumnAggregateFooterDropdownContext =
  createContext<RecordTableColumnAggregateFooterDropdownContextValue>(
    {} as RecordTableColumnAggregateFooterDropdownContextValue,
  );
