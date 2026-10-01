import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { createContext } from 'react';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

// The created record's join column must point at a first-hop record (e.g. Company → People → Opportunities).
export type RecordTableWidgetNestedRelationCreateThrough = {
  relationObjectMetadataNameSingular: string;
  relationRecordsFilter: RecordGqlOperationFilter;
  nestedRelationJoinColumnName: string;
};

// Adding means picking an existing target and creating the junction record linking it.
export type RecordTableWidgetJunctionCreateThrough = {
  junctionObjectMetadataId: string;
  junctionObjectMetadataNameSingular: string;
  sourceJoinColumnName: string;
  sourceRecordId: string;
  targetJoinColumnName: string;
  targetObjectMetadataNameSingular: string;
  targetRecordsFilter: RecordGqlOperationFilter;
};

export type RecordTableWidgetContextValue = {
  isPageLayoutInEditMode: boolean;
  pageLayoutId?: string;
  widgetId: string;
  nestedRelationCreateThrough?: RecordTableWidgetNestedRelationCreateThrough;
  junctionCreateThrough?: RecordTableWidgetJunctionCreateThrough;
  updateViewDraftField: (
    viewFieldId: string,
    update: {
      aggregateOperation?: AggregateOperations | null;
      size?: number;
    },
  ) => void;
  updateViewDraft: (update: {
    kanbanAggregateOperation?: AggregateOperations | null;
    kanbanAggregateOperationFieldMetadataId?: string | null;
    kanbanColumnWidth?: number | null;
  }) => void;
};

export const RecordTableWidgetContext =
  createContext<RecordTableWidgetContextValue | null>(null);
