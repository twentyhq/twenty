import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type View } from '@/views/types/View';
import { createContext } from 'react';

export type RecordTableWidgetViewContextValue = {
  currentView: View | undefined;
  updateDraftViewFieldAggregateOperation?: (
    fieldMetadataId: string,
    aggregateOperation: AggregateOperations | null,
  ) => void;
};

export const RecordTableWidgetViewContext =
  createContext<RecordTableWidgetViewContextValue | null>(null);
