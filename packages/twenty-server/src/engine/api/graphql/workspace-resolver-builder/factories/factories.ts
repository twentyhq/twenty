import { UpdateManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/update-many-resolver.factory';

import { FindDuplicatesResolverFactory } from './find-duplicates-resolver.factory';
import { FindManyResolverFactory } from './find-many-resolver.factory';
import { FindOneResolverFactory } from './find-one-resolver.factory';
import { CreateManyResolverFactory } from './create-many-resolver.factory';
import { CreateOneResolverFactory } from './create-one-resolver.factory';
import { UpdateOneResolverFactory } from './update-one-resolver.factory';
import { DeleteOneResolverFactory } from './delete-one-resolver.factory';
import { DeleteManyResolverFactory } from './delete-many-resolver.factory';
import { ExecuteQuickActionOnOneResolverFactory } from './execute-quick-action-on-one-resolver.factory';

export const workspaceResolverBuilderFactories = [
  FindManyResolverFactory,
  FindOneResolverFactory,
  FindDuplicatesResolverFactory,
  CreateManyResolverFactory,
  CreateOneResolverFactory,
  UpdateOneResolverFactory,
  DeleteOneResolverFactory,
  ExecuteQuickActionOnOneResolverFactory,
  UpdateManyResolverFactory,
  DeleteManyResolverFactory,
];

export const workspaceResolverBuilderMethodNames = {
  queries: [
    FindManyResolverFactory.methodName,
    FindOneResolverFactory.methodName,
    FindDuplicatesResolverFactory.methodName,
  ],
  mutations: [
    CreateManyResolverFactory.methodName,
    CreateOneResolverFactory.methodName,
    UpdateOneResolverFactory.methodName,
    DeleteOneResolverFactory.methodName,
    ExecuteQuickActionOnOneResolverFactory.methodName,
    UpdateManyResolverFactory.methodName,
    DeleteManyResolverFactory.methodName,
  ],
} as const;
