import { type ShareWithInput } from 'src/engine/permissions/record-share/types/share-with-input.type';
import { type RecordSortToCompute } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/utils/compute-record-gql-operation-order-by-from-flat-maps.util';

import { type ObjectRecordProperties } from './object-record-properties.type';

export type CreateRecordInput = {
  objectName: string;
  objectRecord: ObjectRecordProperties;
  upsert?: boolean;
  shareWith?: ShareWithInput[];
};

export type UpdateRecordInput = {
  objectName: string;
  objectRecordId: string;
  objectRecord: ObjectRecordProperties;
  fieldsToUpdate?: string[];
};

export type DeleteRecordInput = {
  objectName: string;
  objectRecordId: string;
};

export type FindRecordsInput = {
  objectName: string;
  filter?: {
    // oxlint-disable-next-line typescript/no-explicit-any
    recordFilterGroups?: any;
    // oxlint-disable-next-line typescript/no-explicit-any
    recordFilters?: any;
  };
  orderBy?: {
    recordSorts?: RecordSortToCompute[];
  };
  limit?: number;
  offset?: number;
};

export type UpsertRecordInput = {
  objectName: string;
  objectRecord: ObjectRecordProperties;
};
