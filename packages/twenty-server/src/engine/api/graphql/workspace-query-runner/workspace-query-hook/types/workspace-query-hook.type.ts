import {
  type CreateManyResolverArgs,
  type CreateOneResolverArgs,
  type DeleteManyResolverArgs,
  type DeleteOneResolverArgs,
  type DestroyManyResolverArgs,
  type DestroyOneResolverArgs,
  type FindDuplicatesResolverArgs,
  type FindManyResolverArgs,
  type FindOneResolverArgs,
  type GroupByResolverArgs,
  type MergeManyResolverArgs,
  type RestoreManyResolverArgs,
  type UpdateManyResolverArgs,
  type UpdateOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

export enum WorkspaceQueryHookType {
  PRE_HOOK = 'PRE_HOOK',
  POST_HOOK = 'POST_HOOK',
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
                  : T extends 'restoreMany'
                    ? RestoreManyResolverArgs
                    : T extends 'destroyMany'
                      ? DestroyManyResolverArgs
                      : T extends 'destroyOne'
                        ? DestroyOneResolverArgs
                        : T extends 'mergeMany'
                          ? MergeManyResolverArgs
                          : T extends 'groupBy'
                            ? GroupByResolverArgs
                            : never;
