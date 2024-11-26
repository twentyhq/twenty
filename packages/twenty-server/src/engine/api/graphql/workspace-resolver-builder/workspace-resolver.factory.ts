import { Injectable, Logger } from '@nestjs/common';

import { IResolvers } from '@graphql-tools/utils';

import { DeleteManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/delete-many-resolver.factory';
import { DestroyManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/destroy-many-resolver.factory';
import { DestroyOneResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/destroy-one-resolver.factory';
import { RestoreManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/restore-many-resolver.factory';
import { RestoreOneResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/restore-one-resolver.factory';
import { SearchResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/search-resolver-factory';
import { UpdateManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/update-many-resolver.factory';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getResolverName } from 'src/engine/utils/get-resolver-name.util';

import { CreateManyResolverFactory } from './factories/create-many-resolver.factory';
import { CreateOneResolverFactory } from './factories/create-one-resolver.factory';
import { DeleteOneResolverFactory } from './factories/delete-one-resolver.factory';
import { FindDuplicatesResolverFactory } from './factories/find-duplicates-resolver.factory';
import { FindManyResolverFactory } from './factories/find-many-resolver.factory';
import { FindOneResolverFactory } from './factories/find-one-resolver.factory';
import { UpdateOneResolverFactory } from './factories/update-one-resolver.factory';
import { WorkspaceResolverBuilderFactoryInterface } from './interfaces/workspace-resolver-builder-factory.interface';
import {
  WorkspaceResolverBuilderMethodNames,
  WorkspaceResolverBuilderMethods,
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
    private readonly searchResolverFactory: SearchResolverFactory,
  ) {}

  async create(
    authContext: AuthContext,
    objectMetadataMaps: ObjectMetadataMaps,
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
      ['restoreMany', this.restoreManyResolverFactory],
      ['restoreOne', this.restoreOneResolverFactory],
      ['search', this.searchResolverFactory],
      ['updateMany', this.updateManyResolverFactory],
      ['updateOne', this.updateOneResolverFactory],
    ]);
    const resolvers: IResolvers = {
      Query: {},
      Mutation: {},
    };

    for (const objectMetadata of Object.values(objectMetadataMaps.byId)) {
      // Generate query resolvers
      for (const methodName of workspaceResolverBuilderMethods.queries) {
        const resolverName = getResolverName(objectMetadata, methodName);
        const resolverFactory = factories.get(methodName);

        if (!resolverFactory) {
          this.logger.error(`Unknown query resolver type: ${methodName}`, {
            objectMetadata,
            methodName,
            resolverName,
          });

          throw new Error(`Unknown query resolver type: ${methodName}`);
        }

        resolvers.Query[resolverName] = resolverFactory.create({
          authContext,
          objectMetadataMaps,
          objectMetadataItemWithFieldMaps: objectMetadata,
        });
      }

      // Generate mutation resolvers
      for (const methodName of workspaceResolverBuilderMethods.mutations) {
        const resolverName = getResolverName(objectMetadata, methodName);
        const resolverFactory = factories.get(methodName);

        if (!resolverFactory) {
          this.logger.error(`Unknown mutation resolver type: ${methodName}`, {
            objectMetadata,
            methodName,
            resolverName,
          });

          throw new Error(`Unknown mutation resolver type: ${methodName}`);
        }

        resolvers.Mutation[resolverName] = resolverFactory.create({
          authContext,
          objectMetadataMaps,
          objectMetadataItemWithFieldMaps: objectMetadata,
        });
      }
    }

    return resolvers;
  }
}
