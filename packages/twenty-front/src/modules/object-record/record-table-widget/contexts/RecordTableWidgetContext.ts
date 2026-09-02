import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { createContext } from 'react';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

// Creating a record in a nested relation widget requires picking the related
// record to create through: the created record's join column has to point at
// a record of the widget's first hop (e.g. picking one of the company's
// people before creating an opportunity on a Company → People → Opportunities
// widget).
export type RecordTableWidgetNestedRelationCreateThrough = {
  relationObjectMetadataNameSingular: string;
  relationRecordsFilter: RecordGqlOperationFilter;
  nestedRelationJoinColumnName: string;
};

export type RecordTableWidgetContextValue = {
  isPageLayoutInEditMode: boolean;
  pageLayoutId?: string;
  widgetId: string;
  nestedRelationCreateThrough?: RecordTableWidgetNestedRelationCreateThrough;
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
