import { Injectable, Logger } from '@nestjs/common';

import { type IResolvers } from '@graphql-tools/utils';
import { isDefined } from 'twenty-shared/utils';

import { type DeleteManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/delete-many-resolver.factory';
import { type DestroyManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/destroy-many-resolver.factory';
import { type DestroyOneResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/destroy-one-resolver.factory';
import { type GroupByResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/group-by-resolver.factory';
import { type MergeManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/merge-many-resolver.factory';
import { type RestoreManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/restore-many-resolver.factory';
import { type RestoreOneResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/restore-one-resolver.factory';
import { type UpdateManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/update-many-resolver.factory';
import { type WorkspaceResolverBuilderService } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver-builder.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getResolverName } from 'src/engine/utils/get-resolver-name.util';

import { type CreateManyResolverFactory } from './factories/create-many-resolver.factory';
import { type CreateOneResolverFactory } from './factories/create-one-resolver.factory';
import { type DeleteOneResolverFactory } from './factories/delete-one-resolver.factory';
import { type FindDuplicatesResolverFactory } from './factories/find-duplicates-resolver.factory';
import { type FindManyResolverFactory } from './factories/find-many-resolver.factory';
import { type FindOneResolverFactory } from './factories/find-one-resolver.factory';
import { type UpdateOneResolverFactory } from './factories/update-one-resolver.factory';
import { type WorkspaceResolverBuilderFactoryInterface } from './interfaces/workspace-resolver-builder-factory.interface';
import {
  type WorkspaceResolverBuilderMethodNames,
  type WorkspaceResolverBuilderMethods,
} from './interfaces/workspace-resolvers-builder.interface';

@Injectable()
export class WorkspaceResolverFactory {
  private readonly logger = new Logger(WorkspaceResolverFactory.name);

  constructor(
    private readonly findManyResolverFactory: FindManyResolverFactory,
    private readonly findOneResolverFactory: FindOneResolverFactory,
    private readonly findDuplicatesResolverFactory: FindDuplicatesResolverFactory,
    private readonly createManyResolverFactory: CreateManyResolverFactory,
    private readonly createOneResolverFactory: CreateOneResolverFactory,
    private readonly updateOneResolverFactory: UpdateOneResolverFactory,
    private readonly deleteOneResolverFactory: DeleteOneResolverFactory,
    private readonly destroyOneResolverFactory: DestroyOneResolverFactory,
    private readonly updateManyResolverFactory: UpdateManyResolverFactory,
    private readonly deleteManyResolverFactory: DeleteManyResolverFactory,
    private readonly restoreOneResolverFactory: RestoreOneResolverFactory,
    private readonly restoreManyResolverFactory: RestoreManyResolverFactory,
    private readonly destroyManyResolverFactory: DestroyManyResolverFactory,
    private readonly mergeManyResolverFactory: MergeManyResolverFactory,
    private readonly groupByResolverFactory: GroupByResolverFactory,
    private readonly workspaceResolverBuilderService: WorkspaceResolverBuilderService,
  ) {}

  async create(
    authContext: AuthContext,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    objectIdByNameSingular: Record<string, string>,
    workspaceResolverBuilderMethods: WorkspaceResolverBuilderMethods,
  ): Promise<IResolvers> {
    const factories = new Map<
      WorkspaceResolverBuilderMethodNames,
      WorkspaceResolverBuilderFactoryInterface
    >([
      ['createMany', this.createManyResolverFactory],
      ['createOne', this.createOneResolverFactory],
      ['deleteMany', this.deleteManyResolverFactory],
      ['deleteOne', this.deleteOneResolverFactory],
      ['destroyMany', this.destroyManyResolverFactory],
      ['destroyOne', this.destroyOneResolverFactory],
      ['findDuplicates', this.findDuplicatesResolverFactory],
      ['findMany', this.findManyResolverFactory],
      ['findOne', this.findOneResolverFactory],
      ['mergeMany', this.mergeManyResolverFactory],
      ['restoreMany', this.restoreManyResolverFactory],
      ['restoreOne', this.restoreOneResolverFactory],
      ['updateMany', this.updateManyResolverFactory],
      ['updateOne', this.updateOneResolverFactory],
      ['groupBy', this.groupByResolverFactory],
    ]);
    const resolvers: IResolvers = {
      Query: {},
      Mutation: {},
    };

    const workspaceId = authContext.workspace?.id;

    if (!workspaceId) {
      throw new AuthException(
        'Unauthenticated',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }

    for (const flatObjectMetadata of Object.values(
      flatObjectMetadataMaps.byId,
    ).filter(isDefined)) {
      // Generate query resolvers
      for (const methodName of workspaceResolverBuilderMethods.queries) {
        const resolverName = getResolverName(flatObjectMetadata, methodName);
        const resolverFactory = factories.get(methodName);

        if (!resolverFactory) {
          this.logger.error(`Unknown query resolver type: ${methodName}`, {
            flatObjectMetadata,
            methodName,
            resolverName,
          });

          throw new Error(`Unknown query resolver type: ${methodName}`);
        }

        if (
          this.workspaceResolverBuilderService.shouldBuildResolver(
            flatObjectMetadata,
            methodName,
          )
        ) {
          // @ts-expect-error legacy noImplicitAny
          resolvers.Query[resolverName] = resolverFactory.create({
            authContext,
            flatObjectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            objectIdByNameSingular,
          });
        }
      }

      // Generate mutation resolvers
      for (const methodName of workspaceResolverBuilderMethods.mutations) {
        const resolverName = getResolverName(flatObjectMetadata, methodName);
        const resolverFactory = factories.get(methodName);

        if (!resolverFactory) {
          this.logger.error(`Unknown mutation resolver type: ${methodName}`, {
            flatObjectMetadata,
            methodName,
            resolverName,
          });

          throw new Error(`Unknown mutation resolver type: ${methodName}`);
        }

        if (
          this.workspaceResolverBuilderService.shouldBuildResolver(
            flatObjectMetadata,
            methodName,
          )
        ) {
          // @ts-expect-error legacy noImplicitAny
          resolvers.Mutation[resolverName] = resolverFactory.create({
            authContext,
            flatObjectMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
            objectIdByNameSingular,
          });
        }
      }
    }

    return resolvers;
  }
}
