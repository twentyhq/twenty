import { Injectable, Logger } from '@nestjs/common';

import { type GraphQLOutputType } from 'graphql';
import { type FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/object-type-definition-kind.enum';
import { TypeDefinitionsStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/type-definitions.storage';
import { computeObjectMetadataObjectTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-object-type-key.util';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Injectable()
export class ExtendedRelationObjectTypeGenerator {
  private readonly logger = new Logger(
    ExtendedRelationObjectTypeGenerator.name,
  );

  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  public generate(
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

    const relationGqlType = this.typeDefinitionsStorage.getObjectTypeByKey(key);

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
