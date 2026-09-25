import { type RecordTableColumnAggregateFooterDropdownContextValue } from '@/object-record/record-table/record-table-footer/types/RecordTableColumnAggregateFooterDropdownContextValue';
import { createContext } from 'react';

export const RecordTableColumnAggregateFooterDropdownContext =
  createContext<RecordTableColumnAggregateFooterDropdownContextValue>(
    {} as RecordTableColumnAggregateFooterDropdownContextValue,
  );
