import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  isInputObjectType,
} from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
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
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class ObjectMetadataOrderByGqlInputTypeGenerator {
  private readonly logger = new Logger(
    ObjectMetadataOrderByGqlInputTypeGenerator.name,
  );
  constructor(
    private readonly gqlTypesStorage: GqlTypesStorage,
    private readonly relationFieldMetadataGqlInputTypeGenerator: RelationFieldMetadataGqlInputTypeGenerator,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public buildAndStore({
    objectMetadata,
    isGroupBy,
  }: {
    objectMetadata: ObjectMetadataEntity;
    isGroupBy: boolean;
  }) {
    const inputType = new GraphQLInputObjectType({
      name: isGroupBy
        ? `${pascalCase(objectMetadata.nameSingular)}${GqlInputTypeDefinitionKind.OrderByWithGroupBy.toString()}Input`
        : `${pascalCase(objectMetadata.nameSingular)}${GqlInputTypeDefinitionKind.OrderBy.toString()}Input`,
      description: objectMetadata.description,
      fields: () => this.generateFields(objectMetadata, isGroupBy),
    }) as GraphQLInputObjectType;

    const key = computeObjectMetadataInputTypeKey(
      objectMetadata.nameSingular,
      isGroupBy
        ? GqlInputTypeDefinitionKind.OrderByWithGroupBy
        : GqlInputTypeDefinitionKind.OrderBy,
    );

    this.gqlTypesStorage.addGqlType(key, inputType);
  }

  private generateFields(
    objectMetadata: ObjectMetadataEntity,
    isGroupBy: boolean,
  ): GraphQLInputFieldConfigMap {
    const allGeneratedFields: GraphQLInputFieldConfigMap = {};

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
            },
          );
      } else if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        generatedFields = this.generateCompositeFieldOrderByInputType(
          fieldMetadata,
          typeOptions,
          isGroupBy,
        );
      } else {
        generatedFields = this.generateAtomicFieldOrderByInputType(
          fieldMetadata,
          typeOptions,
          isGroupBy,
        );
      }

      Object.assign(allGeneratedFields, generatedFields);
    }

    return allGeneratedFields;
  }

  private generateCompositeFieldOrderByInputType(
    fieldMetadata: FieldMetadataEntity,
    typeOptions: TypeOptions,
    isGroupBy: boolean,
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

    if (isGroupBy) {
      const aggregations =
        this.generateAggregateFieldOrderByInputType(fieldMetadata);

      return aggregations;
    } else {
      return {
        [fieldMetadata.name]: {
          type: compositeType,
          description: fieldMetadata.description,
        },
      };
    }
  }

  private generateAtomicFieldOrderByInputType(
    fieldMetadata: FieldMetadataEntity,
    typeOptions: TypeOptions,
    isGroupBy: boolean,
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

    if (isGroupBy) {
      const aggregations =
        this.generateAggregateFieldOrderByInputType(fieldMetadata);

      return aggregations;
    } else {
      return {
        [fieldMetadata.name]: {
          type: orderByType,
          description: fieldMetadata.description,
        },
      };
    }
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
