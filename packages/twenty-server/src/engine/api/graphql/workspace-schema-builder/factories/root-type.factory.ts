import { Injectable, Logger } from '@nestjs/common';

import { GraphQLFieldConfigMap, GraphQLObjectType } from 'graphql';

import { WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { getResolverArgs } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-resolver-args.util';
import { getResolverName } from 'src/engine/utils/get-resolver-name.util';

import { ArgsFactory } from './args.factory';
import { ObjectTypeDefinitionKind } from './object-type-definition.factory';

export enum ObjectTypeName {
  Query = 'Query',
  Mutation = 'Mutation',
  Subscription = 'Subscription',
}

@Injectable()
export class RootTypeFactory {
  private readonly logger = new Logger(RootTypeFactory.name);

  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
    private readonly typeMapperService: TypeMapperService,
    private readonly argsFactory: ArgsFactory,
  ) {}

  create(
    objectMetadataCollection: ObjectMetadataInterface[],
    workspaceResolverMethodNames: WorkspaceResolverBuilderMethodNames[],
    objectTypeName: ObjectTypeName,
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLObjectType {
    if (workspaceResolverMethodNames.length === 0) {
      this.logger.error(
        `No resolver methods were found for ${objectTypeName.toString()}`,
        {
          workspaceResolverMethodNames,
          objectTypeName,
          options,
        },
      );

      throw new Error(
        `No resolvers were found for ${objectTypeName.toString()}`,
      );
    }

    return new GraphQLObjectType({
      name: objectTypeName.toString(),
      fields: this.generateFields(
        objectMetadataCollection,
        workspaceResolverMethodNames,
        options,
      ),
    });
  }

  private generateFields<T = any, U = any>(
    objectMetadataCollection: ObjectMetadataInterface[],
    workspaceResolverMethodNames: WorkspaceResolverBuilderMethodNames[],
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLFieldConfigMap<T, U> {
    const fieldConfigMap: GraphQLFieldConfigMap<T, U> = {};

    for (const objectMetadata of objectMetadataCollection) {
      for (const methodName of workspaceResolverMethodNames) {
        const name = getResolverName(objectMetadata, methodName);
        const args = getResolverArgs(methodName);
        const objectType = this.typeDefinitionsStorage.getObjectTypeByKey(
          objectMetadata.id,
          this.getObjectTypeDefinitionKindByMethodName(methodName),
        );
        const argsType = this.argsFactory.create(
          {
            args,
            objectMetadataId: objectMetadata.id,
          },
          options,
        );

        if (!objectType) {
          this.logger.error(
            `Could not find a GraphQL type for ${objectMetadata.id} for method ${methodName}`,
            {
              objectMetadata,
              methodName,
              options,
            },
          );

          throw new Error(
            `Could not find a GraphQL type for ${objectMetadata.id} for method ${methodName}`,
          );
        }

        const allowedMethodNames = [
          'updateMany',
          'deleteMany',
          'createMany',
          'findDuplicates',
          'restoreMany',
          'destroyMany',
        ];

        const outputType = this.typeMapperService.mapToGqlType(objectType, {
          isArray: allowedMethodNames.includes(methodName),
        });

        fieldConfigMap[name] = {
          type: outputType,
          args: argsType,
          resolve: undefined,
        };
      }
    }

    return fieldConfigMap;
  }

  private getObjectTypeDefinitionKindByMethodName(
    methodName: WorkspaceResolverBuilderMethodNames,
  ): ObjectTypeDefinitionKind {
    switch (methodName) {
      case 'findMany':
      case 'findDuplicates':
      case 'search':
        return ObjectTypeDefinitionKind.Connection;
      default:
        return ObjectTypeDefinitionKind.Plain;
    }
  }
}
