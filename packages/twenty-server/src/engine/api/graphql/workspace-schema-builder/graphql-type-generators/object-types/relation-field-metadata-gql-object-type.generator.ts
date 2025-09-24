import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  TypeMapperService,
  TypeOptions,
} from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { extractGraphQLRelationFieldNames } from 'src/engine/api/graphql/workspace-schema-builder/utils/extract-graphql-relation-field-names.util';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

@Injectable()
export class RelationFieldMetadataGqlObjectTypeGenerator {
  private readonly logger = new Logger(
    RelationFieldMetadataGqlObjectTypeGenerator.name,
  );

  constructor(private readonly typeMapperService: TypeMapperService) {}

  public generateRelationFieldObjectType({
    fieldMetadata,
    typeOptions,
  }: {
    fieldMetadata: FieldMetadataEntity<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
    typeOptions: TypeOptions;
  }) {
    if (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY)
      return {};

    const { joinColumnName } = extractGraphQLRelationFieldNames(fieldMetadata);

    const type = this.typeMapperService.mapToScalarType(
      fieldMetadata.type,
      typeOptions,
    );

    if (!isDefined(type)) {
      const message = `Could not find a GraphQL output type for ${type} field metadata`;

      this.logger.error(message, {
        type,
        typeOptions,
      });
      throw new Error(message);
    }

    const modifiedType = this.typeMapperService.applyTypeOptions(
      type,
      typeOptions,
    );

    return {
      [joinColumnName]: {
        type: modifiedType,
        description: fieldMetadata.description,
      },
    };
  }
}
