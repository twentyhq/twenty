import {
  type ObjectRecord,
  type OrderByWithGroupBy,
} from 'twenty-shared/types';

import {
  type ObjectRecordFilter,
  type ObjectRecordGroupBy,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';

export enum CommonQueryNames {
  findOne = 'findOne',
  findMany = 'findMany',
  createMany = 'createMany',
  groupBy = 'groupBy',
}

export interface FindOneQueryArgs {
  selectedFieldsResult: CommonSelectedFieldsResult;
  filter?: ObjectRecordFilter;
}

export interface FindManyQueryArgs {
  selectedFieldsResult: CommonSelectedFieldsResult;
  filter?: ObjectRecordFilter;
  orderBy?: ObjectRecordOrderBy;
  first?: number;
  last?: number;
  before?: string;
  after?: string;
}

export interface CreateManyQueryArgs {
  selectedFieldsResult: CommonSelectedFieldsResult;
  data: Partial<ObjectRecord>[];
  upsert?: boolean;
}

export interface CreateOneQueryArgs {
  selectedFieldsResult: CommonSelectedFieldsResult;
  data: Partial<ObjectRecord>;
  upsert?: boolean;
}
export interface GroupByQueryArgs {
  selectedFieldsResult: CommonSelectedFieldsResult;
  filter?: ObjectRecordFilter;
  orderBy?: OrderByWithGroupBy;
  groupBy: ObjectRecordGroupBy;
  viewId?: string;
}

export type CommonQueryArgs =
  | FindOneQueryArgs
  | FindManyQueryArgs
  | GroupByQueryArgs;
