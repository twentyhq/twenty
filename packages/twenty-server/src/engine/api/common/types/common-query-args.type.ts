import {
  type ObjectRecord,
  type OrderByWithGroupBy,
} from 'twenty-shared/types';

import {
  type ObjectRecordFilter,
  type ObjectRecordGroupBy,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  type CommonSelectedFields,
  type CommonSelectedFieldsResult,
} from 'src/engine/api/common/types/common-selected-fields-result.type';

export enum CommonQueryNames {
  FIND_ONE = 'findOne',
  FIND_MANY = 'findMany',
  CREATE_ONE = 'createOne',
  CREATE_MANY = 'createMany',
  GROUP_BY = 'groupBy',
  DESTROY_MANY = 'destroyMany',
  DESTROY_ONE = 'destroyOne',
  DELETE_MANY = 'deleteMany',
  DELETE_ONE = 'deleteOne',
}

interface BaseQueryArgs {
  selectedFields: CommonSelectedFields;
}

interface ExtendedBaseQueryArgs {
  selectedFieldsResult: CommonSelectedFieldsResult;
}
export interface FindOneQueryArgs extends BaseQueryArgs {
  filter?: ObjectRecordFilter;
}

export interface FindManyQueryArgs {
  filter?: ObjectRecordFilter;
  orderBy?: ObjectRecordOrderBy;
  first?: number;
  last?: number;
  before?: string;
  after?: string;
}

export interface CreateManyQueryArgs {
  data: Partial<ObjectRecord>[];
  upsert?: boolean;
}

export interface CreateOneQueryArgs {
  data: Partial<ObjectRecord>;
  upsert?: boolean;
}
export interface GroupByQueryArgs {
  filter?: ObjectRecordFilter;
  orderBy?: OrderByWithGroupBy;
  groupBy: ObjectRecordGroupBy;
  viewId?: string;
}
export interface DestroyOneQueryArgs {
  id: string;
}

export interface DestroyManyQueryArgs {
  filter: ObjectRecordFilter;
}

export interface DeleteOneQueryArgs {
  id: string;
}

export interface DeleteManyQueryArgs {
  filter: ObjectRecordFilter;
}

export type CommonQueryArgs =
  | FindOneQueryArgs
  | FindManyQueryArgs
  | CreateManyQueryArgs
  | CreateOneQueryArgs
  | GroupByQueryArgs
  | DestroyOneQueryArgs
  | DestroyManyQueryArgs
  | DeleteOneQueryArgs
  | DeleteManyQueryArgs;

export type CommonInput<T extends CommonQueryArgs> = T & BaseQueryArgs;

export type CommonExtendedInput<T extends CommonQueryArgs> = T &
  ExtendedBaseQueryArgs;
