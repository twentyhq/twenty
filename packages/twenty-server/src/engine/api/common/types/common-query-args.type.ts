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
  UPDATE_ONE = 'updateOne',
  UPDATE_MANY = 'updateMany',
  FIND_DUPLICATES = 'findDuplicates',
  RESTORE_MANY = 'restoreMany',
  RESTORE_ONE = 'restoreOne',
  MERGE_MANY = 'mergeMany',
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
  offset?: number;
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
  orderByForRecords?: ObjectRecordOrderBy;
  groupBy: ObjectRecordGroupBy;
  viewId?: string;
  includeRecords?: boolean;
  selectedFields: CommonSelectedFields;
  limit?: number;
  offsetForRecords?: number;
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

export interface UpdateOneQueryArgs {
  id: string;
  data: Partial<ObjectRecord>;
}

export interface UpdateManyQueryArgs {
  filter: ObjectRecordFilter;
  data: Partial<ObjectRecord>;
}

export interface FindDuplicatesQueryArgs {
  data?: Partial<ObjectRecord>[];
  ids?: string[];
}

export interface RestoreManyQueryArgs {
  filter: ObjectRecordFilter;
}

export interface RestoreOneQueryArgs {
  id: string;
}

export interface MergeManyQueryArgs {
  ids: string[];
  conflictPriorityIndex: number;
  dryRun?: boolean;
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
  | DeleteManyQueryArgs
  | UpdateOneQueryArgs
  | UpdateManyQueryArgs
  | FindDuplicatesQueryArgs
  | RestoreManyQueryArgs
  | RestoreOneQueryArgs;

export type CommonInput<T extends CommonQueryArgs> = T & BaseQueryArgs;

export type CommonExtendedInput<T extends CommonQueryArgs> = T &
  ExtendedBaseQueryArgs;
