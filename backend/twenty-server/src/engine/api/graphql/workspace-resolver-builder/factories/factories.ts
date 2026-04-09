import { DestroyManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/destroy-many-resolver.factory';
import { DestroyOneResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/destroy-one-resolver.factory';
import { GroupByResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/group-by-resolver.factory';
import { RestoreManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/restore-many-resolver.factory';
import { RestoreOneResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/restore-one-resolver.factory';
import { UpdateManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/update-many-resolver.factory';

import { CreateManyResolverFactory } from './create-many-resolver.factory';
import { CreateOneResolverFactory } from './create-one-resolver.factory';
import { DeleteManyResolverFactory } from './delete-many-resolver.factory';
import { DeleteOneResolverFactory } from './delete-one-resolver.factory';
import { FindDuplicatesResolverFactory } from './find-duplicates-resolver.factory';
import { FindManyResolverFactory } from './find-many-resolver.factory';
import { FindOneResolverFactory } from './find-one-resolver.factory';
import { MergeManyResolverFactory } from './merge-many-resolver.factory';
import { UpdateOneResolverFactory } from './update-one-resolver.factory';

export const workspaceResolverBuilderFactories = [
  FindManyResolverFactory,
  FindOneResolverFactory,
  FindDuplicatesResolverFactory,
  CreateManyResolverFactory,
  CreateOneResolverFactory,
  UpdateOneResolverFactory,
  DeleteOneResolverFactory,
  UpdateManyResolverFactory,
  DeleteManyResolverFactory,
  DestroyOneResolverFactory,
  DestroyManyResolverFactory,
  RestoreOneResolverFactory,
  RestoreManyResolverFactory,
  MergeManyResolverFactory,
  GroupByResolverFactory,
];

export const workspaceResolverBuilderMethodNames = {
  queries: [
    FindManyResolverFactory.methodName,
    FindOneResolverFactory.methodName,
    FindDuplicatesResolverFactory.methodName,
    GroupByResolverFactory.methodName,
  ],
  mutations: [
    CreateManyResolverFactory.methodName,
    CreateOneResolverFactory.methodName,
    UpdateOneResolverFactory.methodName,
    DeleteOneResolverFactory.methodName,
    UpdateManyResolverFactory.methodName,
    DeleteManyResolverFactory.methodName,
    DestroyOneResolverFactory.methodName,
    DestroyManyResolverFactory.methodName,
    RestoreOneResolverFactory.methodName,
    RestoreManyResolverFactory.methodName,
    MergeManyResolverFactory.methodName,
  ],
} as const;
