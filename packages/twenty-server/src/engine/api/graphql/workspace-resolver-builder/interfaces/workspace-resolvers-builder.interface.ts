import { GraphQLFieldResolver } from 'graphql';

import {
  Record,
  RecordFilter,
  RecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

import { workspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/factories/factories';

export type Resolver<Args = any> = GraphQLFieldResolver<any, any, Args>;

export interface FindManyResolverArgs<
  Filter extends RecordFilter = RecordFilter,
  OrderBy extends RecordOrderBy = RecordOrderBy,
> {
  first?: number;
  last?: number;
  before?: string;
  after?: string;
  filter?: Filter;
  orderBy?: OrderBy;
}

export interface FindOneResolverArgs<Filter = any> {
  filter?: Filter;
}

export interface FindDuplicatesResolverArgs<Data extends Record = Record> {
  id?: string;
  data?: Data;
}

export interface CreateOneResolverArgs<Data extends Record = Record> {
  data: Data;
}

export interface CreateManyResolverArgs<Data extends Record = Record> {
  data: Data[];
}

export interface UpdateOneResolverArgs<Data extends Record = Record> {
  id: string;
  data: Data;
}

export interface UpdateManyResolverArgs<
  Data extends Record = Record,
  Filter = any,
> {
  filter: Filter;
  data: Data;
}

export interface DeleteOneResolverArgs {
  id: string;
}

export interface ExecuteQuickActionOnOneResolverArgs {
  id: string;
}

export interface DeleteManyResolverArgs<Filter = any> {
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
  | FindManyResolverArgs
  | FindOneResolverArgs
  | FindDuplicatesResolverArgs
  | UpdateManyResolverArgs
  | UpdateOneResolverArgs;
