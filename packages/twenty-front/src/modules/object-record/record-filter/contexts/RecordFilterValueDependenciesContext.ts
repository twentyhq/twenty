import { createContext } from 'react';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export type RecordFilterValueDependenciesContextValue = {
  currentRecordId?: string;
  // When a relation field is rendered as a record table on a record page
  // (FieldWidgetRelationTable), this carries a hard filter that scopes the
  // table to the host record's related records. It is ANDed into every query
  // for that table instance so that supplying a viewId (which provides the
  // columns) does not discard the relation filter. Undefined for every other
  // table.
  relationTableFilter?: RecordGqlOperationFilter;
};

export const RecordFilterValueDependenciesContext =
  createContext<RecordFilterValueDependenciesContextValue>({});
