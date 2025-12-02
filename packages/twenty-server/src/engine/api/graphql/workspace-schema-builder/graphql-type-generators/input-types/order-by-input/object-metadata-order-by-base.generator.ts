import { Injectable, Logger } from '@nestjs/common';

import { GraphQLInputFieldConfigMap, isInputObjectType } from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { ORDER_BY_DATE_GRANULARITY_INPUT_KEY } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/group-by-input/group-by-date-granularity-gql-input-type.generator';
import { RelationFieldMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/relation-field-metadata-gql-type.generator';
import {
  TypeMapperService,
  TypeOptions,
} from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { computeFieldInputTypeOptions } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-field-input-type-options.util';
import { computeCompositeFieldInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-input-type-key.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

@Injectable()
export class ObjectMetadataOrderByBaseGenerator {
  constructor(
    private readonly gqlTypesStorage: GqlTypesStorage,
    private readonly relationFieldMetadataGqlInputTypeGenerator: RelationFieldMetadataGqlInputTypeGenerator,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public generateFields({
    fields,
    logger,
    isForGroupBy,
    context,
  }: {
    fields: FlatFieldMetadata[];
    logger: Logger;
    isForGroupBy?: boolean;
    context?: SchemaGenerationContext;
  }): GraphQLInputFieldConfigMap {
    const allGeneratedFields: GraphQLInputFieldConfigMap = {};

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
              isForGroupBy,
              context,
            },
          );
      } else if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        generatedFields = this.generateCompositeFieldOrderByInputType(
          fieldMetadata,
          typeOptions,
          logger,
        );
      } else {
        generatedFields = this.generateAtomicFieldOrderByInputType({
          fieldMetadata,
          typeOptions,
          isForGroupBy,
          logger,
        });
      }

      Object.assign(allGeneratedFields, generatedFields);
    }

    return allGeneratedFields;
  }

  private generateCompositeFieldOrderByInputType(
    fieldMetadata: FlatFieldMetadata,
    typeOptions: TypeOptions,
    logger: Logger,
  ) {
    const key = computeCompositeFieldInputTypeKey(
      fieldMetadata.type,
      GqlInputTypeDefinitionKind.OrderBy,
    );

    const compositeType = this.gqlTypesStorage.getGqlTypeByKey(key);

    if (!isDefined(compositeType) || !isInputObjectType(compositeType)) {
      const message = `Could not find a GraphQL input type for ${fieldMetadata.type} field metadata`;

      logger.error(message, {
        fieldMetadata,
        typeOptions,
      });
      throw new Error(message);
    }

    return {
      [fieldMetadata.name]: {
        type: compositeType,
        description: fieldMetadata.description,
      },
    };
  }

  private generateAtomicFieldOrderByInputType({
    fieldMetadata,
    typeOptions,
    logger,
    isForGroupBy,
  }: {
    fieldMetadata: FlatFieldMetadata;
    typeOptions: TypeOptions;
    logger: Logger;
    isForGroupBy?: boolean;
  }) {
    if (
      isForGroupBy === true &&
      (fieldMetadata.type === FieldMetadataType.DATE ||
        fieldMetadata.type === FieldMetadataType.DATE_TIME)
    ) {
      const orderByDateGranularityInputType =
        this.gqlTypesStorage.getGqlTypeByKey(
          ORDER_BY_DATE_GRANULARITY_INPUT_KEY,
        );

      if (!isDefined(orderByDateGranularityInputType)) {
        throw new Error('OrderByDateGranularityInputType not found');
      }

      return {
        [fieldMetadata.name]: {
          type: orderByDateGranularityInputType,
          description: fieldMetadata.description,
        },
      };
    }

    const orderByType = this.typeMapperService.mapToOrderByType(
      fieldMetadata.type,
    );

    if (!isDefined(orderByType)) {
      const message = `Could not find a GraphQL input type for ${fieldMetadata.type} field metadata`;

      logger.error(message, {
        fieldMetadata,
        typeOptions,
      });
      throw new Error(message);
    }

    return {
      [fieldMetadata.name]: {
        type: orderByType,
        description: fieldMetadata.description,
      },
    };
  }
}
