import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type ObjectRecordProperties } from './object-record-properties.type';

export type CreateRecordInput = {
  objectName: string;
  objectRecord: ObjectRecordProperties;
  upsert?: boolean;
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
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    recordFilterGroups?: any;
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    recordFilters?: any;
    gqlOperationFilter?: Partial<ObjectRecordFilter>[];
  };
  orderBy?: {
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    recordSorts?: any;
    gqlOperationOrderBy?: Partial<ObjectRecordOrderBy>;
  };
  limit?: number;
};

export type UpsertRecordInput = {
  objectName: string;
  objectRecord: ObjectRecordProperties;
};
