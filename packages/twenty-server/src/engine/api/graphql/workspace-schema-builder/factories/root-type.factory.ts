import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLFieldConfigArgumentMap,
  type GraphQLFieldConfigMap,
  GraphQLObjectType,
  GraphQLOutputType,
} from 'graphql';

import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { WorkspaceResolverBuilderService } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver-builder.service';
import { GqlObjectTypeName } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-object-type-name.enum';
import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { ArgsTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/args.factory';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { getResolverArgs } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-resolver-args.util';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { getResolverName } from 'src/engine/utils/get-resolver-name.util';

export type GraphQLRootTypeFieldConfigMap = GraphQLFieldConfigMap<
  string,
  {
    type: GraphQLOutputType;
    args: GraphQLFieldConfigArgumentMap;
    resolve: undefined;
  }
>;
@Injectable()
export class RootTypeGenerator {
  private readonly logger = new Logger(RootTypeGenerator.name);

  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
    private readonly typeMapperService: TypeMapperService,
    private readonly argsTypeGenerator: ArgsTypeGenerator,
    private readonly workspaceResolverBuilderService: WorkspaceResolverBuilderService,
  ) {}

  generate(
    objectMetadataCollection: ObjectMetadataEntity[],
    workspaceResolverMethodNames: WorkspaceResolverBuilderMethodNames[],
    objectTypeName: GqlObjectTypeName,
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

  private generateFields(
    objectMetadataCollection: ObjectMetadataEntity[],
    workspaceResolverMethodNames: WorkspaceResolverBuilderMethodNames[],
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLRootTypeFieldConfigMap {
    const fieldConfigMap: GraphQLRootTypeFieldConfigMap = {};

    for (const objectMetadata of objectMetadataCollection) {
      for (const methodName of workspaceResolverMethodNames) {
        if (
          this.workspaceResolverBuilderService.shouldBuildResolver(
            objectMetadata,
            methodName,
          )
        ) {
          const name = getResolverName(objectMetadata, methodName);
          const args = getResolverArgs(methodName);
          const key = computeObjectMetadataObjectTypeKey(
            objectMetadata.nameSingular,
            this.getObjectTypeDefinitionKindByMethodName(methodName),
          );
          const objectType =
            this.typeDefinitionsStorage.getObjectTypeByKey(key);

          const argsType = this.argsTypeGenerator.generate(
            {
              args,
              objectMetadataSingularName: objectMetadata.nameSingular,
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
    }

    return fieldConfigMap;
  }

  private getObjectTypeDefinitionKindByMethodName(
    methodName: WorkspaceResolverBuilderMethodNames,
  ): ObjectTypeDefinitionKind {
    switch (methodName) {
      case 'findMany':
      case 'findDuplicates':
        return ObjectTypeDefinitionKind.Connection;
      default:
        return ObjectTypeDefinitionKind.Plain;
    }
  }
}
