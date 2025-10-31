import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLBoolean,
  GraphQLInputFieldConfigMap,
  isObjectType,
} from 'graphql';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  TypeMapperService,
  TypeOptions,
} from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { computeRelationConnectInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-relation-connect-input-type-key.util';
import { extractGraphQLRelationFieldNames } from 'src/engine/api/graphql/workspace-schema-builder/utils/extract-graphql-relation-field-names.util';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

@Injectable()
export class RelationFieldMetadataGqlInputTypeGenerator {
  private readonly logger = new Logger(
    RelationFieldMetadataGqlInputTypeGenerator.name,
  );

  constructor(
    private readonly typeMapperService: TypeMapperService,
    private readonly gqlTypesStorage: GqlTypesStorage,
  ) {}

  public generateSimpleRelationFieldCreateOrUpdateInputType({
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
      const message = `Could not find a GraphQL input type for ${type} field metadata`;

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

  public generateSimpleRelationFieldFilterInputType({
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

    const type = this.typeMapperService.mapToFilterType(
      fieldMetadata.type,
      typeOptions,
    );

    if (!isDefined(type)) {
      const message = `Could not find a GraphQL input type for ${type} field metadata`;

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

  public generateSimpleRelationFieldOrderByInputType({
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

    const type = this.typeMapperService.mapToOrderByType(fieldMetadata.type);

    if (!isDefined(type)) {
      const message = `Could not find a GraphQL input type for ${type} field metadata`;

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

  public generateSimpleRelationFieldGroupByInputType(
    fieldMetadata: FieldMetadataEntity<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >,
  ): GraphQLInputFieldConfigMap {
    if (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY)
      return {};

    const { joinColumnName } = extractGraphQLRelationFieldNames(fieldMetadata);

    const type = this.typeMapperService.applyTypeOptions(GraphQLBoolean, {});

    return {
      [joinColumnName]: {
        type,
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

    const type = this.gqlTypesStorage.getGqlTypeByKey(key);

    if (!isDefined(type) || isObjectType(type)) {
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
