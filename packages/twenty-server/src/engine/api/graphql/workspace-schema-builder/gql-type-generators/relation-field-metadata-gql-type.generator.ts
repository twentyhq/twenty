import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { FieldInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/field-input-type.generator';
import {
  TypeMapperService,
  TypeOptions,
} from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { computeRelationConnectInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-relation-connect-input-type-key.util';
import { extractGraphQLRelationFieldNames } from 'src/engine/api/graphql/workspace-schema-builder/utils/extract-graphql-relation-field-names.util';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

@Injectable()
export class RelationFieldMetadataGqlTypeGenerator {
  private readonly logger = new Logger(
    RelationFieldMetadataGqlTypeGenerator.name,
  );

  constructor(
    private readonly fieldInputTypeGenerator: FieldInputTypeGenerator,
    private readonly typeMapperService: TypeMapperService,
  ) {}

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

  public generateSimpleRelationFieldInputType({
    fieldMetadata,
    kind,
    typeOptions,
  }: {
    fieldMetadata: FieldMetadataEntity<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
    kind: GqlInputTypeDefinitionKind;
    typeOptions: TypeOptions;
  }) {
    if (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY)
      return {};

    const { joinColumnName } = extractGraphQLRelationFieldNames(fieldMetadata);

    return {
      [joinColumnName]: {
        type: this.fieldInputTypeGenerator.generate({
          type: fieldMetadata.type,
          kind,
          buildOptions,
          typeOptions,
          key: undefined,
        }),
        description: fieldMetadata.description,
      },
    };
  }

  public generateConnectRelationFieldInputType({
    fieldMetadata,
    typeOptions,
  }: {
    fieldMetadata: FieldMetadataEntity<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
    typeOptions: TypeOptions;
  }) {
    if (
      fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY ||
      //TODO : Enable connect on morph relation - @guillim
      fieldMetadata.type === FieldMetadataType.MORPH_RELATION
    ) {
      return {};
    }

    const { fieldMetadataName } =
      extractGraphQLRelationFieldNames(fieldMetadata);

    if (!isDefined(fieldMetadata.relationTargetObjectMetadataId)) {
      throw new Error(
        `Target object metadata not found for field metadata ${fieldMetadata.id}`,
      );
    }

    const key = computeRelationConnectInputTypeKey(
      fieldMetadata.relationTargetObjectMetadataId,
    );

    const type = this.typeDefinitionsStorage.getInputTypeByKey(key);

    if (!type) {
      throw new Error(`Input type ${key} not found`);
    }

    return {
      [fieldMetadataName]: {
        type: this.typeMapperService.applyTypeOptions(type, typeOptions),
        description: fieldMetadata.description,
      },
    };
  }
}
