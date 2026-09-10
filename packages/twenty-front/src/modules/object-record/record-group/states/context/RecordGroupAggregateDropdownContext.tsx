import { type RecordGroupAggregateDropdownContextValue } from '@/object-record/record-group/types/RecordGroupAggregateDropdownContextValue';
import { createContext } from 'react';

export const RecordGroupAggregateDropdownContext =
  createContext<RecordGroupAggregateDropdownContextValue>(
    {} as RecordGroupAggregateDropdownContextValue,
  );
