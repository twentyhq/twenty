import { Injectable, Logger } from '@nestjs/common';

import { GraphQLOutputType } from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

import { ObjectTypeDefinitionKind } from './object-type-definition.factory';

@Injectable()
export class RelationTypeV2Factory {
  private readonly logger = new Logger(RelationTypeV2Factory.name);

  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(
    fieldMetadata: FieldMetadataEntity<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >,
  ): GraphQLOutputType {
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

    const relationGqlType = this.typeDefinitionsStorage.getObjectTypeByKey(
      fieldMetadata.relationTargetObjectMetadataId,
      fieldMetadata.settings.relationType === RelationType.ONE_TO_MANY
        ? ObjectTypeDefinitionKind.Connection
        : ObjectTypeDefinitionKind.Plain,
    );

    if (!relationGqlType) {
      this.logger.error(
        `Could not find a relation type for ${fieldMetadata.id}`,
        {
          fieldMetadata,
        },
      );

      throw new Error(`Could not find a relation type for ${fieldMetadata.id}`);
    }

    return relationGqlType;
  }
}
