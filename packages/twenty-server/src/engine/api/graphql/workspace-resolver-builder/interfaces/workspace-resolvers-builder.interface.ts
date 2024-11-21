import { GraphQLFieldResolver } from 'graphql';

import {
  ObjectRecord,
  ObjectRecordFilter,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { workspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/factories/factories';

export type Resolver<Args = any> = GraphQLFieldResolver<any, any, Args>;

export enum ResolverArgsType {
  FindMany = 'FindMany',
  FindOne = 'FindOne',
  FindDuplicates = 'FindDuplicates',
  CreateOne = 'CreateOne',
  CreateMany = 'CreateMany',
  UpdateOne = 'UpdateOne',
  UpdateMany = 'UpdateMany',
  DeleteOne = 'DeleteOne',
  DeleteMany = 'DeleteMany',
  RestoreMany = 'RestoreMany',
  DestroyMany = 'DestroyMany',
  DestroyOne = 'DestroyOne',
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

export interface SearchResolverArgs<
  Filter extends ObjectRecordFilter = ObjectRecordFilter,
> {
  searchInput?: string;
  filter?: Filter;
  limit?: number;
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

export interface UpdateOneResolverArgs<
  Data extends Partial<ObjectRecord> = Partial<ObjectRecord>,
> {
  id: string;
  data: Data;
}

export interface UpdateManyResolverArgs<
  Data extends Partial<ObjectRecord> = Partial<ObjectRecord>,
  Filter = any,
> {
  filter: Filter;
  data: Data;
}

export interface DeleteOneResolverArgs {
  id: string;
}

export interface DeleteManyResolverArgs<Filter = any> {
  filter: Filter;
}

export interface RestoreOneResolverArgs {
  id: string;
}

export interface RestoreManyResolverArgs<Filter = any> {
  filter: Filter;
}

export interface DestroyOneResolverArgs {
  id: string;
}

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
  | DeleteManyResolverArgs
  | DeleteOneResolverArgs
  | DestroyManyResolverArgs
  | FindDuplicatesResolverArgs
  | FindManyResolverArgs
  | FindOneResolverArgs
  | RestoreManyResolverArgs
  | RestoreOneResolverArgs
  | SearchResolverArgs
  | UpdateManyResolverArgs
  | UpdateOneResolverArgs;
