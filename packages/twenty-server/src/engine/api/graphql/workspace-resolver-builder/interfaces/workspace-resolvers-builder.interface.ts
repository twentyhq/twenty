import { type GraphQLFieldResolver } from 'graphql';
import {
  type ObjectRecord,
  type OrderByWithGroupBy,
} from 'twenty-shared/types';

import {
  type ObjectRecordFilter,
  type ObjectRecordGroupBy,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type workspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/factories/factories';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Resolver<Args = any> = GraphQLFieldResolver<any, any, Args>;

export enum ResolverArgsType {
  FIND_MANY = 'FIND_MANY',
  FIND_ONE = 'FIND_ONE',
  FIND_DUPLICATES = 'FIND_DUPLICATES',
  CREATE_ONE = 'CREATE_ONE',
  CREATE_MANY = 'CREATE_MANY',
  UPDATE_ONE = 'UPDATE_ONE',
  UPDATE_MANY = 'UPDATE_MANY',
  DELETE_ONE = 'DELETE_ONE',
  DELETE_MANY = 'DELETE_MANY',
  RESTORE_MANY = 'RESTORE_MANY',
  DESTROY_MANY = 'DESTROY_MANY',
  DESTROY_ONE = 'DESTROY_ONE',
  MERGE_MANY = 'MERGE_MANY',
  GROUP_BY = 'GROUP_BY',
}

export interface FindManyResolverArgs<
  Filter extends ObjectRecordFilter = ObjectRecordFilter,
  OrderBy extends ObjectRecordOrderBy = ObjectRecordOrderBy,
> {
  first?: number;
  last?: number;
  before?: string;
  after?: string;
  filter?: Filter;
  orderBy?: OrderBy;
  offset?: number;
}

export interface FindOneResolverArgs<Filter = ObjectRecordFilter> {
  filter?: Filter;
}

export interface FindDuplicatesResolverArgs<
  Data extends Partial<ObjectRecord> = Partial<ObjectRecord>,
> {
  ids?: string[];
  data?: Data[];
}

export interface CreateOneResolverArgs<
  Data extends Partial<ObjectRecord> = Partial<ObjectRecord>,
> {
  data: Data;
  upsert?: boolean;
}

export interface CreateManyResolverArgs<
  Data extends Partial<ObjectRecord> = Partial<ObjectRecord>,
> {
  data: Data[];
  upsert?: boolean;
}

export interface GroupByResolverArgs<Filter = ObjectRecordFilter> {
  filter?: Filter;
  groupBy: ObjectRecordGroupBy;
  viewId?: string;
  orderBy?: OrderByWithGroupBy;
  omitNullValues?: boolean;
}

export interface UpdateOneResolverArgs<
  Data extends Partial<ObjectRecord> = Partial<ObjectRecord>,
> {
  id: string;
  data: Data;
}

export interface UpdateManyResolverArgs<
  Data extends Partial<ObjectRecord> = Partial<ObjectRecord>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Filter = any,
> {
  filter: Filter;
  data: Data;
}

export interface DeleteOneResolverArgs {
  id: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DeleteManyResolverArgs<Filter = any> {
  filter: Filter;
}

export interface RestoreOneResolverArgs {
  id: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface RestoreManyResolverArgs<Filter = any> {
  filter: Filter;
}

export interface MergeManyResolverArgs {
  ids: string[];
  conflictPriorityIndex: number;
  dryRun?: boolean;
}

export interface DestroyOneResolverArgs {
  id: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DestroyManyResolverArgs<Filter = any> {
  filter: Filter;
}

export type WorkspaceResolverBuilderQueryMethodNames =
  (typeof workspaceResolverBuilderMethodNames.queries)[number];

export type WorkspaceResolverBuilderMutationMethodNames =
  (typeof workspaceResolverBuilderMethodNames.mutations)[number];

export type WorkspaceResolverBuilderMethodNames =
  | WorkspaceResolverBuilderQueryMethodNames
  | WorkspaceResolverBuilderMutationMethodNames;

export interface WorkspaceResolverBuilderMethods {
  readonly queries: readonly WorkspaceResolverBuilderQueryMethodNames[];
  readonly mutations: readonly WorkspaceResolverBuilderMutationMethodNames[];
}

export type ResolverArgs =
  | CreateManyResolverArgs
  | CreateOneResolverArgs
  | GroupByResolverArgs
  | DeleteManyResolverArgs
  | DeleteOneResolverArgs
  | DestroyManyResolverArgs
  | FindDuplicatesResolverArgs
  | FindManyResolverArgs
  | FindOneResolverArgs
  | MergeManyResolverArgs
  | RestoreManyResolverArgs
  | RestoreOneResolverArgs
  | UpdateManyResolverArgs
  | UpdateOneResolverArgs;
