import { Injectable, Logger } from '@nestjs/common';

import { GraphQLObjectType, isObjectType } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceResolverBuilderService } from 'src/engine/api/graphql/workspace-resolver-builder/workspace-resolver-builder.service';
import { GqlOperation } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-operation.enum';
import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { ArgsTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/args-type/args-type.generator';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { GraphQLRootTypeFieldConfigMap } from 'src/engine/api/graphql/workspace-schema-builder/types/graphql-field-config-map.types';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { getResolverArgs } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-resolver-args.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getResolverName } from 'src/engine/utils/get-resolver-name.util';

@Injectable()
export class RootTypeGenerator {
  private readonly logger = new Logger(RootTypeGenerator.name);

  constructor(
    private readonly gqlTypesStorage: GqlTypesStorage,
    private readonly typeMapperService: TypeMapperService,
    private readonly argsTypeGenerator: ArgsTypeGenerator,
    private readonly workspaceResolverBuilderService: WorkspaceResolverBuilderService,
  ) {}

  buildAndStore(
    context: SchemaGenerationContext,
    workspaceResolverMethodNames: readonly WorkspaceResolverBuilderMethodNames[],
    objectTypeName: GqlOperation,
  ) {
    if (workspaceResolverMethodNames.length === 0) {
      this.logger.error(
        `No resolver methods were found for ${objectTypeName.toString()}`,
        {
          workspaceResolverMethodNames,
          objectTypeName,
        },
      );

      throw new Error(
        `No resolvers were found for ${objectTypeName.toString()}`,
      );
    }

    const objectMetadataCollection = Object.values(
      context.flatObjectMetadataMaps.byId,
    ).filter(isDefined);

    this.gqlTypesStorage.addGqlType(
      objectTypeName,
      new GraphQLObjectType({
        name: objectTypeName.toString(),
        fields: this.generateFields(
          objectMetadataCollection,
          workspaceResolverMethodNames,
        ),
      }),
    );
  }

  private generateFields(
    objectMetadataCollection: FlatObjectMetadata[],
    workspaceResolverMethodNames: readonly WorkspaceResolverBuilderMethodNames[],
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
          const objectType = this.gqlTypesStorage.getGqlTypeByKey(key);

          const argsType = this.argsTypeGenerator.generate({
            args,
            objectMetadataSingularName: objectMetadata.nameSingular,
          });

          if (!isDefined(objectType) || !isObjectType(objectType)) {
            this.logger.error(
              `Could not find a GraphQL type for ${objectMetadata.id} for method ${methodName}`,
              {
                objectMetadata,
                methodName,
              },
            );

            throw new Error(
              `Could not find a GraphQL type for ${objectMetadata.id} for method ${methodName}`,
            );
          }

          const isMethodReturningArrayObjectType = [
            'updateMany',
            'deleteMany',
            'createMany',
            'findDuplicates',
            'restoreMany',
            'destroyMany',
            'groupBy',
          ];

          const outputType = this.typeMapperService.applyTypeOptions(
            objectType,
            {
              isArray: isMethodReturningArrayObjectType.includes(methodName),
            },
          );

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
      case 'groupBy':
        return ObjectTypeDefinitionKind.GroupByConnection;
      default:
        return ObjectTypeDefinitionKind.Plain;
    }
  }
}
