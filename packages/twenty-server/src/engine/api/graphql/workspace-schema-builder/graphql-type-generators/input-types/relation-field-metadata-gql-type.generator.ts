import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLInputFieldConfigMap,
  isInputObjectType,
  isObjectType,
} from 'graphql';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import {
  type CreateInputTypeOptions,
  applyTypeOptionsForCreateInput,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/apply-type-options-for-create-input.util';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';
import { computeRelationConnectInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-relation-connect-input-type-key.util';
import { extractGraphQLRelationFieldNames } from 'src/engine/api/graphql/workspace-schema-builder/utils/extract-graphql-relation-field-names.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
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
    typeOptions: CreateInputTypeOptions;
  }) {
    if (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY)
      return {};

    const { joinColumnName } = extractGraphQLRelationFieldNames(fieldMetadata);

    const type = this.typeMapperService.mapToPreBuiltGraphQLInputType({
      fieldMetadataType: fieldMetadata.type,
      typeOptions,
    });

    if (!isDefined(type)) {
      const message = `Could not find a GraphQL input type for ${type} field metadata`;

      this.logger.error(message, {
        type,
        typeOptions,
      });
      throw new Error(message);
    }

    const modifiedType = applyTypeOptionsForCreateInput(type, {
      ...typeOptions,
      nullable: true,
    });

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
    context,
  }: {
    fieldMetadata: FlatFieldMetadata<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
    typeOptions: { settings?: FlatFieldMetadata['settings'] };
    context: SchemaGenerationContext;
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

    return {
      [joinColumnName]: {
        type,
        description: fieldMetadata.description,
      },
      ...this.getTargetRelationInputField({
        fieldMetadata,
        context,
        kind: GqlInputTypeDefinitionKind.Filter,
        descriptionPrefix: 'Filter on fields of the related',
      }),
    };
  }

  public generateSimpleRelationFieldOrderByInputType({
    fieldMetadata,
    isForGroupBy,
    context,
  }: {
    fieldMetadata: FlatFieldMetadata<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
    isForGroupBy?: boolean;
    context: SchemaGenerationContext;
  }) {
    if (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY)
      return {};

    const { joinColumnName } = extractGraphQLRelationFieldNames(fieldMetadata);

    const type = this.typeMapperService.mapToOrderByType(fieldMetadata.type);

    if (!isDefined(type)) {
      const message = `Could not find a GraphQL input type for ${type} field metadata`;

      this.logger.error(message, {
        type,
      });
      throw new Error(message);
    }

    return {
      [joinColumnName]: {
        type,
        description: fieldMetadata.description,
      },
      ...this.getTargetRelationInputField({
        fieldMetadata,
        context,
        kind: isForGroupBy
          ? GqlInputTypeDefinitionKind.OrderByWithGroupBy
          : GqlInputTypeDefinitionKind.OrderBy,
        descriptionPrefix: 'Order by fields of the related',
      }),
    };
  }

  public generateSimpleRelationFieldGroupByInputType(
    fieldMetadata: FlatFieldMetadata<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >,
    context: SchemaGenerationContext,
  ): GraphQLInputFieldConfigMap {
    if (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY)
      return {};

    return this.getTargetRelationInputField({
      fieldMetadata,
      context,
      kind: GqlInputTypeDefinitionKind.GroupBy,
      descriptionPrefix: 'Group by fields of the related',
    });
  }

  // Returns a single-entry map keyed by the relation field's GraphQL name,
  // or an empty map when any lookup misses — callers splat it alongside
  // their own fields.
  private getTargetRelationInputField({
    fieldMetadata,
    context,
    kind,
    descriptionPrefix,
  }: {
    fieldMetadata: FlatFieldMetadata<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
    context: SchemaGenerationContext;
    kind: GqlInputTypeDefinitionKind;
    descriptionPrefix: string;
  }): GraphQLInputFieldConfigMap {
    if (!isDefined(fieldMetadata.relationTargetObjectMetadataId)) {
      return {};
    }

    const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
      flatEntityMaps: context.flatObjectMetadataMaps,
    });

    if (!isDefined(targetObjectMetadata)) {
      return {};
    }

    const targetInputType = this.gqlTypesStorage.getGqlTypeByKey(
      computeObjectMetadataInputTypeKey(
        targetObjectMetadata.nameSingular,
        kind,
      ),
    );

    if (!isDefined(targetInputType) || !isInputObjectType(targetInputType)) {
      return {};
    }

    const { fieldMetadataName } =
      extractGraphQLRelationFieldNames(fieldMetadata);

    return {
      [fieldMetadataName]: {
        type: targetInputType,
        description: `${descriptionPrefix} ${targetObjectMetadata.nameSingular}`,
      },
    };
  }

  public generateConnectRelationFieldInputType({
    fieldMetadata,
    typeOptions,
  }: {
    fieldMetadata: FlatFieldMetadata<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >;
    typeOptions: CreateInputTypeOptions;
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
        type: applyTypeOptionsForCreateInput(type, {
          ...typeOptions,
          nullable: true,
        }),
        description: fieldMetadata.description,
      },
    };
  }
}
