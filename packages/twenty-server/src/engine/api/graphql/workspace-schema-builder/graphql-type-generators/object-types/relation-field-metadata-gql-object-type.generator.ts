import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import {
  type OutputTypeOptions,
  applyTypeOptionsForOutputType,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/apply-type-options-for-output-type.util';
import { extractGraphQLRelationFieldNames } from 'src/engine/api/graphql/workspace-schema-builder/utils/extract-graphql-relation-field-names.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

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
    fieldMetadata: FlatFieldMetadata<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
    typeOptions: OutputTypeOptions;
  }) {
    if (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY)
      return {};

    const { joinColumnName } = extractGraphQLRelationFieldNames(fieldMetadata);

    const type = this.typeMapperService.mapToPreBuiltGraphQLOutputType({
      fieldMetadataType: fieldMetadata.type,
      typeOptions,
    });

    if (!isDefined(type)) {
      const message = `Could not find a GraphQL output type for ${type} field metadata`;

      this.logger.error(message, {
        type,
        typeOptions,
      });
      throw new Error(message);
    }

    const modifiedType = applyTypeOptionsForOutputType(type, typeOptions);

    return {
      [joinColumnName]: {
        type: modifiedType,
        description: fieldMetadata.description,
      },
    };
  }
}
