import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLInputFieldConfigMap,
  isInputObjectType,
  isObjectType,
} from 'graphql';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import {
  TypeMapperService,
  TypeOptions,
} from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';
import { computeRelationConnectInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-relation-connect-input-type-key.util';
import { extractGraphQLRelationFieldNames } from 'src/engine/api/graphql/workspace-schema-builder/utils/extract-graphql-relation-field-names.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

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
    fieldMetadata: FlatFieldMetadata<
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
    fieldMetadata: FlatFieldMetadata<
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
    isForGroupBy,
    context,
  }: {
    fieldMetadata: FlatFieldMetadata<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
    typeOptions: TypeOptions;
    isForGroupBy?: boolean;
    context?: SchemaGenerationContext;
  }) {
    if (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY)
      return {};

    const { joinColumnName, fieldMetadataName } =
      extractGraphQLRelationFieldNames(fieldMetadata);

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

    const fields: GraphQLInputFieldConfigMap = {
      [joinColumnName]: {
        type: modifiedType,
        description: fieldMetadata.description,
      },
    };

    if (
      isDefined(fieldMetadata.relationTargetObjectMetadataId) &&
      isDefined(context)
    ) {
      const targetObjectMetadata =
        context.flatObjectMetadataMaps.byId[
          fieldMetadata.relationTargetObjectMetadataId
        ];

      if (isDefined(targetObjectMetadata)) {
        const targetOrderByInputTypeKey = computeObjectMetadataInputTypeKey(
          targetObjectMetadata.nameSingular,
          isForGroupBy
            ? GqlInputTypeDefinitionKind.OrderByWithGroupBy
            : GqlInputTypeDefinitionKind.OrderBy,
        );

        const targetOrderByInputType = this.gqlTypesStorage.getGqlTypeByKey(
          targetOrderByInputTypeKey,
        );

        if (
          isDefined(targetOrderByInputType) &&
          isInputObjectType(targetOrderByInputType)
        ) {
          fields[fieldMetadataName] = {
            type: targetOrderByInputType,
            description: `Order by fields of the related ${targetObjectMetadata.nameSingular}`,
          };
        }
      }
    }

    return fields;
  }

  public generateSimpleRelationFieldGroupByInputType(
    fieldMetadata: FlatFieldMetadata<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >,
    context?: SchemaGenerationContext,
  ): GraphQLInputFieldConfigMap {
    if (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY)
      return {};

    const { fieldMetadataName } =
      extractGraphQLRelationFieldNames(fieldMetadata);

    const fields: GraphQLInputFieldConfigMap = {};

    if (
      isDefined(fieldMetadata.relationTargetObjectMetadataId) &&
      isDefined(context)
    ) {
      const targetObjectMetadata =
        context.flatObjectMetadataMaps.byId[
          fieldMetadata.relationTargetObjectMetadataId
        ];

      if (isDefined(targetObjectMetadata)) {
        const targetGroupByInputTypeKey = computeObjectMetadataInputTypeKey(
          targetObjectMetadata.nameSingular,
          GqlInputTypeDefinitionKind.GroupBy,
        );

        const targetGroupByInputType = this.gqlTypesStorage.getGqlTypeByKey(
          targetGroupByInputTypeKey,
        );

        if (
          isDefined(targetGroupByInputType) &&
          isInputObjectType(targetGroupByInputType)
        ) {
          fields[fieldMetadataName] = {
            type: targetGroupByInputType,
            description: `Group by fields of the related ${targetObjectMetadata.nameSingular}`,
          };
        }
      }
    }

    return fields;
  }

  public generateConnectRelationFieldInputType({
    fieldMetadata,
    typeOptions,
  }: {
    fieldMetadata: FlatFieldMetadata<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
    typeOptions: TypeOptions;
  }) {
    if (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY) {
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
