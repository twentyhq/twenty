import { Injectable, Logger } from '@nestjs/common';

import { IResolvers } from '@graphql-tools/utils';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { getResolverName } from 'src/engine/utils/get-resolver-name.util';
import { UpdateManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/update-many-resolver.factory';
import { DeleteManyResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/delete-many-resolver.factory';
import { ExecuteQuickActionOnOneResolverFactory } from 'src/engine/api/graphql/workspace-resolver-builder/factories/execute-quick-action-on-one-resolver.factory';

import { FindDuplicatesResolverFactory } from './factories/find-duplicates-resolver.factory';
import { FindManyResolverFactory } from './factories/find-many-resolver.factory';
import { FindOneResolverFactory } from './factories/find-one-resolver.factory';
import { CreateManyResolverFactory } from './factories/create-many-resolver.factory';
import { CreateOneResolverFactory } from './factories/create-one-resolver.factory';
import { UpdateOneResolverFactory } from './factories/update-one-resolver.factory';
import { DeleteOneResolverFactory } from './factories/delete-one-resolver.factory';
import {
  WorkspaceResolverBuilderMethodNames,
  WorkspaceResolverBuilderMethods,
} from './interfaces/workspace-resolvers-builder.interface';
import { WorkspaceResolverBuilderFactoryInterface } from './interfaces/workspace-resolver-builder-factory.interface';

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
    private readonly executeQuickActionOnOneResolverFactory: ExecuteQuickActionOnOneResolverFactory,
    private readonly updateManyResolverFactory: UpdateManyResolverFactory,
    private readonly deleteManyResolverFactory: DeleteManyResolverFactory,
  ) {}

  async create(
    workspaceId: string,
    userId: string | undefined,
    objectMetadataCollection: ObjectMetadataInterface[],
    workspaceResolverBuilderMethods: WorkspaceResolverBuilderMethods,
  ): Promise<IResolvers> {
    const factories = new Map<
      WorkspaceResolverBuilderMethodNames,
      WorkspaceResolverBuilderFactoryInterface
    >([
      ['findMany', this.findManyResolverFactory],
      ['findOne', this.findOneResolverFactory],
      ['findDuplicates', this.findDuplicatesResolverFactory],
      ['createMany', this.createManyResolverFactory],
      ['createOne', this.createOneResolverFactory],
      ['updateOne', this.updateOneResolverFactory],
      ['deleteOne', this.deleteOneResolverFactory],
      ['executeQuickActionOnOne', this.executeQuickActionOnOneResolverFactory],
      ['updateMany', this.updateManyResolverFactory],
      ['deleteMany', this.deleteManyResolverFactory],
    ]);
    const resolvers: IResolvers = {
      Query: {},
      Mutation: {},
    };

    for (const objectMetadata of objectMetadataCollection) {
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
          workspaceId,
          userId,
          objectMetadataItem: objectMetadata,
          fieldMetadataCollection: objectMetadata.fields,
          objectMetadataCollection: objectMetadataCollection,
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
          workspaceId,
          userId,
          objectMetadataItem: objectMetadata,
          fieldMetadataCollection: objectMetadata.fields,
          objectMetadataCollection: objectMetadataCollection,
        });
      }
    }

    return resolvers;
  }
}
