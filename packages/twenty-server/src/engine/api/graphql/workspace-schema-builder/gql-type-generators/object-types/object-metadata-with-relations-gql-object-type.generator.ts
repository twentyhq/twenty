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
import { ArgsTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/args-type.generator';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { GraphQLOutputTypeFieldConfigMap } from 'src/engine/api/graphql/workspace-schema-builder/types/graphql-field-config-map.types';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { getResolverArgs } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-resolver-args.util';
import { objectContainsRelationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/object-contains-relation-field';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

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
    objectMetadata: ObjectMetadataEntity,
    objectMetadataCollection: ObjectMetadataEntity[],
  ) {
    const key = computeObjectMetadataObjectTypeKey(
      objectMetadata.nameSingular,
      ObjectTypeDefinitionKind.Plain,
    );

    const gqlType = this.gqlTypesStorage.getGqlTypeByKey(key);

    if (!isDefined(gqlType) || !isObjectType(gqlType)) {
      this.logger.error(
        `Could not find a GraphQL type for ${objectMetadata.id.toString()}`,
        {
          objectMetadata,
        },
      );

      throw new Error(
        `Could not find a GraphQL type for ${objectMetadata.id.toString()}`,
      );
    }

    // Security check to avoid extending an object that does not need to be extended
    if (!objectContainsRelationField(objectMetadata)) {
      this.logger.error(
        `This object does not need to be extended: ${objectMetadata.id.toString()}`,
        {
          objectMetadata,
        },
      );

      throw new Error(
        `This object does not need to be extended: ${objectMetadata.id.toString()}`,
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
          ...this.generateFields(objectMetadata, objectMetadataCollection),
        }),
      }),
    );
  }

  private generateFields(
    objectMetadata: ObjectMetadataEntity,
    objectMetadataCollection: ObjectMetadataEntity[],
  ): GraphQLOutputTypeFieldConfigMap {
    const fields: GraphQLOutputTypeFieldConfigMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      // Ignore non-relation fields as they are already defined
      const isRelation =
        isFieldMetadataEntityOfType(
          fieldMetadata,
          FieldMetadataType.RELATION,
        ) ||
        isFieldMetadataEntityOfType(
          fieldMetadata,
          FieldMetadataType.MORPH_RELATION,
        );

      if (!isRelation) {
        continue;
      }

      if (!fieldMetadata.settings) {
        throw new Error(
          `Field Metadata of type RELATION or MORPH_RELATION with id ${fieldMetadata.id} has no settings`,
        );
      }

      if (!fieldMetadata.relationTargetObjectMetadataId) {
        throw new Error(
          `Field Metadata of type RELATION or MORPH_RELATION with id ${fieldMetadata.id} has no relation target object metadata id`,
        );
      }

      const objectMetadataTarget = objectMetadataCollection.find(
        (objectMetadata) =>
          objectMetadata.id === fieldMetadata.relationTargetObjectMetadataId,
      );

      if (!isDefined(objectMetadataTarget)) {
        throw new Error(
          `Field Metadata of type RELATION or MORPH_RELATION with id ${fieldMetadata.id} has no relation target object metadata`,
        );
      }

      const targetObjectMetadataGqlObjectType =
        this.fetchTargetObjectMetadataGqlObjectType(
          fieldMetadata,
          objectMetadataTarget,
        );

      let argsType: GraphQLFieldConfigArgumentMap | undefined = undefined;

      if (fieldMetadata.settings.relationType === RelationType.ONE_TO_MANY) {
        const args = getResolverArgs('findMany');

        argsType = this.argsTypeGenerator.generate({
          args,
          objectMetadataSingularName: objectMetadataTarget.nameSingular,
        });
      }

      fields[fieldMetadata.name] = {
        type: targetObjectMetadataGqlObjectType,
        args: argsType,
        description: fieldMetadata.description,
      };
    }

    return fields;
  }

  private fetchTargetObjectMetadataGqlObjectType(
    fieldMetadata: FieldMetadataEntity<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >,
    objectMetadataTarget: ObjectMetadataEntity,
  ): GraphQLOutputType {
    if (!fieldMetadata.settings) {
      throw new Error(
        `Field Metadata of type RELATION or MORPH_RELATION with id ${fieldMetadata.id} has no settings`,
      );
    }

    const key = computeObjectMetadataObjectTypeKey(
      objectMetadataTarget.nameSingular,
      fieldMetadata.settings.relationType === RelationType.ONE_TO_MANY
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
        `Could not find a relation type for ${fieldMetadata.id}`,
        {
          fieldMetadata,
        },
      );

      throw new Error(`Could not find a relation type for ${fieldMetadata.id}`);
    }

    return targetObjectMetadataGqlObjectType;
  }
}
