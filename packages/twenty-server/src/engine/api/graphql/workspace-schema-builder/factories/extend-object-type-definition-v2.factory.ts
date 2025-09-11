import { Injectable, Logger } from '@nestjs/common';

import { GraphQLObjectType, type GraphQLFieldConfigArgumentMap } from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { ArgsTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/args.factory';
import { StoredObjectType } from 'src/engine/api/graphql/workspace-schema-builder/factories/composite-object-type-definition.factory';
import { GraphQLOutputTypeFieldConfigMap } from 'src/engine/api/graphql/workspace-schema-builder/factories/object-type-definition.factory';
import { ExtendedRelationObjectTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/factories/relation-type-v2.factory';
import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { getResolverArgs } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-resolver-args.util';
import { objectContainsRelationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/object-contains-relation-field';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

@Injectable()
export class ExtendedObjectMetadataObjectTypeGenerator {
  private readonly logger = new Logger(
    ExtendedObjectMetadataObjectTypeGenerator.name,
  );

  constructor(
    private readonly extendedRelationObjectTypeGenerator: ExtendedRelationObjectTypeGenerator,
    private readonly argsTypeGenerator: ArgsTypeGenerator,
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public generate(
    objectMetadata: ObjectMetadataEntity,
    options: WorkspaceBuildSchemaOptions,
    objectMetadataCollection: ObjectMetadataEntity[],
  ): StoredObjectType {
    const key = computeObjectMetadataObjectTypeKey(
      objectMetadata.nameSingular,
      ObjectTypeDefinitionKind.Plain,
    );

    const gqlType = this.typeDefinitionsStorage.getObjectTypeByKey(key);

    if (!gqlType) {
      this.logger.error(
        `Could not find a GraphQL type for ${objectMetadata.id.toString()}`,
        {
          objectMetadata,
          options,
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
          options,
        },
      );

      throw new Error(
        `This object does not need to be extended: ${objectMetadata.id.toString()}`,
      );
    }

    // Extract current object config to extend it
    const config = gqlType.toConfig();

    // Recreate the same object type with the new fields
    return {
      key,
      type: new GraphQLObjectType({
        ...config,
        fields: () => ({
          ...config.fields,
          ...this.generateFields(
            objectMetadata,
            options,
            objectMetadataCollection,
          ),
        }),
      }),
    };
  }

  private generateFields(
    objectMetadata: ObjectMetadataEntity,
    options: WorkspaceBuildSchemaOptions,
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

      const relationType = this.extendedRelationObjectTypeGenerator.generate(
        fieldMetadata,
        objectMetadataTarget,
      );

      let argsType: GraphQLFieldConfigArgumentMap | undefined = undefined;

      if (fieldMetadata.settings.relationType === RelationType.ONE_TO_MANY) {
        const args = getResolverArgs('findMany');

        argsType = this.argsTypeGenerator.generate(
          {
            args,
            objectMetadataSingularName: objectMetadataTarget.nameSingular,
          },
          options,
        );
      }

      fields[fieldMetadata.name] = {
        type: relationType,
        args: argsType,
        description: fieldMetadata.description,
      };
    }

    return fields;
  }
}
