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
import { computeFieldInputTypeOptions } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-field-input-type-options.util';
import { computeCompositeFieldInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-input-type-key.util';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';
import { getAvailableAggregationsFromObjectFields } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { isFieldMetadataRelationOrMorphRelation } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-field-metadata-relation-or-morph-relation.utils';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { generateObjectMetadataMaps } from 'src/engine/metadata-modules/utils/generate-object-metadata-maps.util';
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

  private objectMetadataMaps?: ObjectMetadataMaps;

  public buildAndStore({
    objectMetadata,
    objectMetadataCollection,
  }: {
    objectMetadata: ObjectMetadataEntity;
    objectMetadataCollection?: ObjectMetadataEntity[];
  }) {
    if (isDefined(objectMetadataCollection)) {
      this.objectMetadataMaps = generateObjectMetadataMaps(
        objectMetadataCollection,
      );
    }

    const inputType = new GraphQLInputObjectType({
      name: `${pascalCase(objectMetadata.nameSingular)}${GqlInputTypeDefinitionKind.OrderByWithGroupBy.toString()}Input`,
      description: objectMetadata.description,
      fields: () => this.generateFields(objectMetadata),
    }) as GraphQLInputObjectType;

    const key = computeObjectMetadataInputTypeKey(
      objectMetadata.nameSingular,
      GqlInputTypeDefinitionKind.OrderByWithGroupBy,
    );

    this.gqlTypesStorage.addGqlType(key, inputType);
  }

  private generateFields(
    objectMetadata: ObjectMetadataEntity,
  ): GraphQLInputFieldConfigMap {
    return {
      ...this.generateOrderByOnAggregateFields(objectMetadata),
      ...this.generateOrderByOnDimensionValuesFields(objectMetadata),
    };
  }

  private generateOrderByOnAggregateFields(
    objectMetadata: ObjectMetadataEntity,
  ): GraphQLInputFieldConfigMap {
    const allAggregatedFields: GraphQLInputFieldConfigMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      fieldMetadata.isNullable = true;

      const typeOptions = computeFieldInputTypeOptions(
        fieldMetadata,
        GqlInputTypeDefinitionKind.OrderBy,
      );

      let generatedFields;

      if (isFieldMetadataRelationOrMorphRelation(fieldMetadata)) {
        generatedFields =
          this.relationFieldMetadataGqlInputTypeGenerator.generateSimpleRelationFieldOrderByInputType(
            {
              fieldMetadata,
              typeOptions,
              objectMetadataMaps: this.objectMetadataMaps,
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
      name: `${pascalCase(objectMetadata.nameSingular)}${GqlInputTypeDefinitionKind.OrderByWithGroupBy.toString()}AggregateInput`,
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
    objectMetadata: ObjectMetadataEntity,
  ) {
    return this.objectMetadataOrderByBaseGenerator.generateFields({
      objectMetadata,
      logger: this.logger,
      orderByDateGranularity: true,
      objectMetadataMaps: this.objectMetadataMaps,
    });
  }

  private generateCompositeFieldOrderByInputType(
    fieldMetadata: FieldMetadataEntity,
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
    fieldMetadata: FieldMetadataEntity,
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
    fieldMetadata: FieldMetadataEntity,
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
