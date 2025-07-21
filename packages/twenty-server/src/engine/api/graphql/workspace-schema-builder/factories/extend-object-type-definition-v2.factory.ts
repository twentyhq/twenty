import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfigMap,
  GraphQLObjectType,
} from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { RelationTypeV2Factory } from 'src/engine/api/graphql/workspace-schema-builder/factories/relation-type-v2.factory';
import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { getResolverArgs } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-resolver-args.util';
import { objectContainsRelationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/object-contains-relation-field';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

import { ArgsFactory } from './args.factory';

export enum ObjectTypeDefinitionKind {
  Connection = 'Connection',
  Edge = 'Edge',
  Plain = '',
}

export interface ObjectTypeDefinition {
  target: string;
  kind: ObjectTypeDefinitionKind;
  type: GraphQLObjectType;
}

@Injectable()
export class ExtendObjectTypeDefinitionV2Factory {
  private readonly logger = new Logger(
    ExtendObjectTypeDefinitionV2Factory.name,
  );

  constructor(
    private readonly relationTypeV2Factory: RelationTypeV2Factory,
    private readonly argsFactory: ArgsFactory,
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(
    objectMetadata: ObjectMetadataEntity,
    options: WorkspaceBuildSchemaOptions,
  ): ObjectTypeDefinition {
    const kind = ObjectTypeDefinitionKind.Plain;
    const gqlType = this.typeDefinitionsStorage.getObjectTypeByKey(
      objectMetadata.id,
      kind,
    );
    const containsRelationField = objectContainsRelationField(objectMetadata);

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
    if (!containsRelationField) {
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
      target: objectMetadata.id,
      kind,
      type: new GraphQLObjectType({
        ...config,
        fields: () => ({
          ...config.fields,
          ...this.generateFields(objectMetadata, options),
        }),
      }),
    };
  }

  private generateFields(
    objectMetadata: ObjectMetadataEntity,
    options: WorkspaceBuildSchemaOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): GraphQLFieldConfigMap<any, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fields: GraphQLFieldConfigMap<any, any> = {};

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

      const relationType = this.relationTypeV2Factory.create(fieldMetadata);
      let argsType: GraphQLFieldConfigArgumentMap | undefined = undefined;

      if (fieldMetadata.settings.relationType === RelationType.ONE_TO_MANY) {
        const args = getResolverArgs('findMany');

        argsType = this.argsFactory.create(
          {
            args,
            objectMetadataId: fieldMetadata.relationTargetObjectMetadataId,
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
