import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  isInputObjectType,
} from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { ObjectMetadataOrderByBaseGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/order-by-input/object-metadata-order-by-base.generator';
import { RelationFieldMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/relation-field-metadata-gql-type.generator';
import {
  TypeMapperService,
  TypeOptions,
} from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { computeFieldInputTypeOptions } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-field-input-type-options.util';
import { computeCompositeFieldInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-input-type-key.util';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';
import { getAvailableAggregationsFromObjectFields } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class ObjectMetadataOrderByWithGroupByGqlInputTypeGenerator {
  private readonly logger = new Logger(
    ObjectMetadataOrderByWithGroupByGqlInputTypeGenerator.name,
  );
  constructor(
    private readonly gqlTypesStorage: GqlTypesStorage,
    private readonly relationFieldMetadataGqlInputTypeGenerator: RelationFieldMetadataGqlInputTypeGenerator,
    private readonly objectMetadataOrderByBaseGenerator: ObjectMetadataOrderByBaseGenerator,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public buildAndStore({
    flatObjectMetadata,
    fields,
    context,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
    fields: FlatFieldMetadata[];
    context: SchemaGenerationContext;
  }) {
    const inputType = new GraphQLInputObjectType({
      name: `${pascalCase(flatObjectMetadata.nameSingular)}${GqlInputTypeDefinitionKind.OrderByWithGroupBy.toString()}Input`,
      description: flatObjectMetadata.description,
      fields: () =>
        this.generateFields(flatObjectMetadata.nameSingular, fields, context),
    }) as GraphQLInputObjectType;

    const key = computeObjectMetadataInputTypeKey(
      flatObjectMetadata.nameSingular,
      GqlInputTypeDefinitionKind.OrderByWithGroupBy,
    );

    this.gqlTypesStorage.addGqlType(key, inputType);
  }

  private generateFields(
    objectNameSingular: string,
    fields: FlatFieldMetadata[],
    context: SchemaGenerationContext,
  ): GraphQLInputFieldConfigMap {
    return {
      ...this.generateOrderByOnAggregateFields(
        objectNameSingular,
        fields,
        context,
      ),
      ...this.generateOrderByOnDimensionValuesFields(fields, context),
    };
  }

  private generateOrderByOnAggregateFields(
    objectNameSingular: string,
    fields: FlatFieldMetadata[],
    context: SchemaGenerationContext,
  ): GraphQLInputFieldConfigMap {
    const allAggregatedFields: GraphQLInputFieldConfigMap = {};

    for (const fieldMetadata of fields) {
      const modifiedFieldMetadata = {
        ...fieldMetadata,
        isNullable: true,
      };

      const typeOptions = computeFieldInputTypeOptions(
        modifiedFieldMetadata,
        GqlInputTypeDefinitionKind.OrderBy,
      );

      let generatedFields;

      if (isMorphOrRelationFlatFieldMetadata(fieldMetadata)) {
        generatedFields =
          this.relationFieldMetadataGqlInputTypeGenerator.generateSimpleRelationFieldOrderByInputType(
            {
              fieldMetadata,
              typeOptions,
              context,
            },
          );
      } else if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        generatedFields = this.generateCompositeFieldOrderByInputType(
          fieldMetadata,
          typeOptions,
        );
      } else {
        generatedFields = this.generateAtomicFieldOrderByInputType(
          fieldMetadata,
          typeOptions,
        );
      }

      Object.assign(allAggregatedFields, generatedFields);
    }

    const aggregateInputType = new GraphQLInputObjectType({
      name: `${pascalCase(objectNameSingular)}${GqlInputTypeDefinitionKind.OrderByWithGroupBy.toString()}AggregateInput`,
      description: 'Aggregate-based ordering',
      fields: () => allAggregatedFields,
    }) as GraphQLInputObjectType;

    return {
      aggregate: {
        type: aggregateInputType,
        description: 'Order by aggregate values',
      },
    };
  }

  private generateOrderByOnDimensionValuesFields(
    fields: FlatFieldMetadata[],
    context: SchemaGenerationContext,
  ) {
    return this.objectMetadataOrderByBaseGenerator.generateFields({
      fields,
      logger: this.logger,
      isForGroupBy: true,
      context,
    });
  }

  private generateCompositeFieldOrderByInputType(
    fieldMetadata: FlatFieldMetadata,
    typeOptions: TypeOptions,
  ) {
    const key = computeCompositeFieldInputTypeKey(
      fieldMetadata.type,
      GqlInputTypeDefinitionKind.OrderBy,
    );

    const compositeType = this.gqlTypesStorage.getGqlTypeByKey(key);

    if (!isDefined(compositeType) || !isInputObjectType(compositeType)) {
      const message = `Could not find a GraphQL input type for ${fieldMetadata.type} field metadata`;

      this.logger.error(message, {
        fieldMetadata,
        typeOptions,
      });
      throw new Error(message);
    }

    const aggregations =
      this.generateAggregateFieldOrderByInputType(fieldMetadata);

    return aggregations;
  }

  private generateAtomicFieldOrderByInputType(
    fieldMetadata: FlatFieldMetadata,
    typeOptions: TypeOptions,
  ) {
    const orderByType = this.typeMapperService.mapToOrderByType(
      fieldMetadata.type,
    );

    if (!isDefined(orderByType)) {
      const message = `Could not find a GraphQL input type for ${fieldMetadata.type} field metadata`;

      this.logger.error(message, {
        fieldMetadata,
        typeOptions,
      });
      throw new Error(message);
    }

    const aggregations =
      this.generateAggregateFieldOrderByInputType(fieldMetadata);

    return aggregations;
  }

  private generateAggregateFieldOrderByInputType(
    fieldMetadata: FlatFieldMetadata,
  ) {
    const aggregations = getAvailableAggregationsFromObjectFields([
      fieldMetadata,
    ]);

    let result: GraphQLInputFieldConfigMap = {};

    for (const [aggregationKey, aggregationDetails] of Object.entries(
      aggregations,
    )) {
      const orderByWithGroupByType =
        this.typeMapperService.mapToOrderByWithGroupByType(
          aggregations[aggregationKey].aggregateOperation,
        );

      if (!isDefined(orderByWithGroupByType)) {
        const message = `Could not find a GraphQL input type for ${aggregations.type} aggregation`;

        this.logger.error(message, {
          aggregations,
        });
        throw new Error(message);
      }

      result[aggregationKey] = {
        type: orderByWithGroupByType,
        description: aggregationDetails.description,
      };
    }

    return result;
  }
}
