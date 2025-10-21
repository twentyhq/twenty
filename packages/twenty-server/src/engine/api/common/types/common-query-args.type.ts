import {
  type ObjectRecord,
  type OrderByWithGroupBy,
} from 'twenty-shared/types';

import {
  type ObjectRecordFilter,
  type ObjectRecordGroupBy,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';

export enum CommonQueryNames {
  FIND_ONE = 'findOne',
  FIND_MANY = 'findMany',
  CREATE_MANY = 'createMany',
  GROUP_BY = 'groupBy',
}

export interface FindOneQueryArgs {
  selectedFields: CommonSelectedFields;
  filter?: ObjectRecordFilter;
}

export interface FindManyQueryArgs {
  selectedFields: CommonSelectedFields;
  filter?: ObjectRecordFilter;
  orderBy?: ObjectRecordOrderBy;
  first?: number;
  last?: number;
  before?: string;
  after?: string;
}

export interface CreateManyQueryArgs {
  selectedFields: CommonSelectedFields;
  data: Partial<ObjectRecord>[];
  upsert?: boolean;
}

export interface CreateOneQueryArgs {
  selectedFields: CommonSelectedFields;
  data: Partial<ObjectRecord>;
  upsert?: boolean;
}
export interface GroupByQueryArgs {
  selectedFields: CommonSelectedFields;
  filter?: ObjectRecordFilter;
  orderBy?: OrderByWithGroupBy;
  groupBy: ObjectRecordGroupBy;
  omitNullValues?: boolean;
  viewId?: string;
}

export type CommonQueryArgs =
  | FindOneQueryArgs
  | FindManyQueryArgs
  | GroupByQueryArgs;
