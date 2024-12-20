import { AggregateContentId } from '@/object-record/record-board/types/AggregateContentId';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { createContext } from 'react';

export type RecordTableColumnAggregateFooterDropdownContextValue = {
  currentContentId: AggregateContentId | null;
  onContentChange: (key: AggregateContentId) => void;
  resetContent: () => void;
  dropdownId: string;
  column: ColumnDefinition<FieldMetadata>;
};

export const RecordTableColumnAggregateFooterDropdownContext =
  createContext<RecordTableColumnAggregateFooterDropdownContextValue>(
    {} as RecordTableColumnAggregateFooterDropdownContextValue,
  );
