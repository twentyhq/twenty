import { Injectable, Logger } from '@nestjs/common';

import { GraphQLOutputType } from 'graphql';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { RelationMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-metadata.interface';

import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { RelationDirection } from 'src/engine/utils/deduce-relation-direction.util';

import { ObjectTypeDefinitionKind } from './object-type-definition.factory';

@Injectable()
export class RelationTypeFactory {
  private readonly logger = new Logger(RelationTypeFactory.name);

  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public create(
    fieldMetadata: FieldMetadataInterface,
    relationMetadata: RelationMetadataInterface,
    relationDirection: RelationDirection,
  ): GraphQLOutputType {
    let relationGqlType: GraphQLOutputType | undefined = undefined;

    if (
      relationDirection === RelationDirection.FROM &&
      relationMetadata.relationType === RelationMetadataType.ONE_TO_MANY
    ) {
      relationGqlType = this.typeDefinitionsStorage.getObjectTypeByKey(
        relationMetadata.toObjectMetadataId,
        ObjectTypeDefinitionKind.Connection,
      );
    } else {
      const relationObjectId =
        relationDirection === RelationDirection.FROM
          ? relationMetadata.toObjectMetadataId
          : relationMetadata.fromObjectMetadataId;

      relationGqlType = this.typeDefinitionsStorage.getObjectTypeByKey(
        relationObjectId,
        ObjectTypeDefinitionKind.Plain,
      );
    }

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
