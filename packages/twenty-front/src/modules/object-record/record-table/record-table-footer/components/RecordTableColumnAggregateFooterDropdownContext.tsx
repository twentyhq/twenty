import { type RecordTableFooterAggregateContentId } from '@/object-record/record-table/record-table-footer/types/RecordTableFooterAggregateContentId';
import { createContext } from 'react';
import { type FieldMetadataType } from '~/generated-metadata/graphql';

export type RecordTableColumnAggregateFooterDropdownContextValue = {
  currentContentId: RecordTableFooterAggregateContentId | null;
  onContentChange: (key: RecordTableFooterAggregateContentId) => void;
  resetContent: () => void;
  dropdownId: string;
  fieldMetadataId: string;
  fieldMetadataType?: FieldMetadataType;
};

export const RecordTableColumnAggregateFooterDropdownContext =
  createContext<RecordTableColumnAggregateFooterDropdownContextValue>(
    {} as RecordTableColumnAggregateFooterDropdownContextValue,
  );
