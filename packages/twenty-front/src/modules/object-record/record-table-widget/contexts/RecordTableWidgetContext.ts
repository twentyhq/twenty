import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { createContext } from 'react';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

// Creating in a nested relation widget first picks a first-hop record for the join column (e.g. Company → People → Opportunities).
export type RecordTableWidgetNestedRelationCreateThrough = {
  relationObjectMetadataNameSingular: string;
  relationRecordsFilter: RecordGqlOperationFilter;
  nestedRelationJoinColumnName: string;
};

// Adding to a junction widget picks an existing target and creates the junction record linking it, not a new target.
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
