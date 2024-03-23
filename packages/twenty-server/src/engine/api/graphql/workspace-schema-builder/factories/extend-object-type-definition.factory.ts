import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfigMap,
  GraphQLObjectType,
} from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { objectContainsRelationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/object-contains-relation-field';
import { getResolverArgs } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-resolver-args.util';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import {
  RelationDirection,
  deduceRelationDirection,
} from 'src/engine/utils/deduce-relation-direction.util';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

import { RelationTypeFactory } from './relation-type.factory';
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
export class ExtendObjectTypeDefinitionFactory {
  private readonly logger = new Logger(ExtendObjectTypeDefinitionFactory.name);

  constructor(
    private readonly relationTypeFactory: RelationTypeFactory,
    private readonly argsFactory: ArgsFactory,
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(
    objectMetadata: ObjectMetadataInterface,
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
    objectMetadata: ObjectMetadataInterface,
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLFieldConfigMap<any, any> {
    const fields: GraphQLFieldConfigMap<any, any> = {};

    for (const fieldMetadata of objectMetadata.fields) {
      // Ignore relation fields as they are already defined
      if (!isRelationFieldMetadataType(fieldMetadata.type)) {
        continue;
      }

      const relationMetadata =
        fieldMetadata.fromRelationMetadata ?? fieldMetadata.toRelationMetadata;

      if (!relationMetadata) {
        this.logger.error(
          `Could not find a relation metadata for ${fieldMetadata.id}`,
          { fieldMetadata },
        );

        throw new Error(
          `Could not find a relation metadata for ${fieldMetadata.id}`,
        );
      }

      const relationDirection = deduceRelationDirection(
        fieldMetadata,
        relationMetadata,
      );
      const relationType = this.relationTypeFactory.create(
        fieldMetadata,
        relationMetadata,
        relationDirection,
      );
      let argsType: GraphQLFieldConfigArgumentMap | undefined = undefined;

      // Args are only needed when relation is of kind `oneToMany` and the relation direction is `from`
      if (
        relationMetadata.relationType === RelationMetadataType.ONE_TO_MANY &&
        relationDirection === RelationDirection.FROM
      ) {
        const args = getResolverArgs('findMany');

        argsType = this.argsFactory.create(
          {
            args,
            objectMetadataId: relationMetadata.toObjectMetadataId,
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
