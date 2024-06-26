import {
  CreateManyResolverArgs,
  CreateOneResolverArgs,
  DeleteManyResolverArgs,
  DeleteOneResolverArgs,
  FindDuplicatesResolverArgs,
  FindManyResolverArgs,
  FindOneResolverArgs,
  UpdateManyResolverArgs,
  UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

export enum WorkspaceQueryHookType {
  PreHook = 'PreHook',
  PostHook = 'PostHook',
}

export type WorkspacePreQueryHookPayload<T> = T extends 'createMany'
  ? CreateManyResolverArgs
  : T extends 'createOne'
    ? CreateOneResolverArgs
    : T extends 'deleteMany'
      ? DeleteManyResolverArgs
      : T extends 'deleteOne'
        ? DeleteOneResolverArgs
        : T extends 'findMany'
          ? FindManyResolverArgs
          : T extends 'findOne'
            ? FindOneResolverArgs
            : T extends 'updateMany'
              ? UpdateManyResolverArgs
              : T extends 'updateOne'
                ? UpdateOneResolverArgs
                : T extends 'findDuplicates'
                  ? FindDuplicatesResolverArgs
                  : never;
