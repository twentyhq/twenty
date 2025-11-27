import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLObjectType,
  GraphQLOutputType,
  isObjectType,
  type GraphQLFieldConfigArgumentMap,
} from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { ArgsTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/args-type/args-type.generator';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { GraphQLOutputTypeFieldConfigMap } from 'src/engine/api/graphql/workspace-schema-builder/types/graphql-field-config-map.types';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { getResolverArgs } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-resolver-args.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';

@Injectable()
export class ObjectMetadataWithRelationsGqlObjectTypeGenerator {
  private readonly logger = new Logger(
    ObjectMetadataWithRelationsGqlObjectTypeGenerator.name,
  );

  constructor(
    private readonly argsTypeGenerator: ArgsTypeGenerator,
    private readonly gqlTypesStorage: GqlTypesStorage,
  ) {}

  public buildAndStore(
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadatas: FlatFieldMetadata[],
    context: SchemaGenerationContext,
  ) {
    const key = computeObjectMetadataObjectTypeKey(
      flatObjectMetadata.nameSingular,
      ObjectTypeDefinitionKind.Plain,
    );

    const gqlType = this.gqlTypesStorage.getGqlTypeByKey(key);

    if (!isDefined(gqlType) || !isObjectType(gqlType)) {
      this.logger.error(
        `Could not find a GraphQL type for ${flatObjectMetadata.id.toString()}`,
      );

      throw new Error(
        `Could not find a GraphQL type for ${flatObjectMetadata.id.toString()}`,
      );
    }

    const containsRelationOrMorphField = flatFieldMetadatas.some((field) =>
      isMorphOrRelationFieldMetadataType(field.type),
    );

    // Security check to avoid extending an object that does not need to be extended
    if (!containsRelationOrMorphField) {
      this.logger.error(
        `This object does not need to be extended: ${flatObjectMetadata.id.toString()}`,
      );

      throw new Error(
        `This object does not need to be extended: ${flatObjectMetadata.id.toString()}`,
      );
    }

    // Extract current object config to extend it
    const config = gqlType.toConfig();

    // Recreate the same object type with the new fields
    this.gqlTypesStorage.addGqlType(
      key,
      new GraphQLObjectType({
        ...config,
        fields: () => ({
          ...config.fields,
          ...this.generateFields(flatFieldMetadatas, context),
        }),
      }),
    );
  }

  private generateFields(
    flatFieldMetadatas: FlatFieldMetadata[],
    context: SchemaGenerationContext,
  ): GraphQLOutputTypeFieldConfigMap {
    const outputFields: GraphQLOutputTypeFieldConfigMap = {};

    for (const flatFieldMetadata of flatFieldMetadatas) {
      if (!isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)) {
        continue;
      }

      if (!flatFieldMetadata.settings) {
        throw new Error(
          `Field Metadata of type RELATION or MORPH_RELATION with id ${flatFieldMetadata.id} has no settings`,
        );
      }

      if (!flatFieldMetadata.relationTargetObjectMetadataId) {
        throw new Error(
          `Field Metadata of type RELATION or MORPH_RELATION with id ${flatFieldMetadata.id} has no relation target object metadata id`,
        );
      }

      const objectMetadataTarget =
        context.flatObjectMetadataMaps.byId[
          flatFieldMetadata.relationTargetObjectMetadataId
        ];

      if (!isDefined(objectMetadataTarget)) {
        throw new Error(
          `Field Metadata of type RELATION or MORPH_RELATION with id ${flatFieldMetadata.id} has no relation target object metadata`,
        );
      }

      const targetObjectMetadataGqlObjectType =
        this.fetchTargetObjectMetadataGqlObjectType(
          flatFieldMetadata,
          objectMetadataTarget,
        );

      let argsType: GraphQLFieldConfigArgumentMap | undefined = undefined;

      if (
        flatFieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY
      ) {
        const args = getResolverArgs('findMany');

        argsType = this.argsTypeGenerator.generate({
          args,
          objectMetadataSingularName: objectMetadataTarget.nameSingular,
        });
      }

      outputFields[flatFieldMetadata.name] = {
        type: targetObjectMetadataGqlObjectType,
        args: argsType,
        description: flatFieldMetadata.description,
      };
    }

    return outputFields;
  }

  private fetchTargetObjectMetadataGqlObjectType(
    flatFieldMetadata: FlatFieldMetadata<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >,
    objectMetadataTarget: FlatObjectMetadata,
  ): GraphQLOutputType {
    if (!flatFieldMetadata.settings) {
      throw new Error(
        `Field Metadata of type RELATION or MORPH_RELATION with id ${flatFieldMetadata.id} has no settings`,
      );
    }

    const key = computeObjectMetadataObjectTypeKey(
      objectMetadataTarget.nameSingular,
      flatFieldMetadata.settings.relationType === RelationType.ONE_TO_MANY
        ? ObjectTypeDefinitionKind.Connection
        : ObjectTypeDefinitionKind.Plain,
    );

    const targetObjectMetadataGqlObjectType =
      this.gqlTypesStorage.getGqlTypeByKey(key);

    if (
      !isDefined(targetObjectMetadataGqlObjectType) ||
      !isObjectType(targetObjectMetadataGqlObjectType)
    ) {
      this.logger.error(
        `Could not find a relation type for ${flatFieldMetadata.id}`,
      );

      throw new Error(
        `Could not find a relation type for ${flatFieldMetadata.id}`,
      );
    }

    return targetObjectMetadataGqlObjectType;
  }
}
