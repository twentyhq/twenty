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
import { computeFieldInputTypeOptions } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-field-input-type-options.util';
import { computeCompositeFieldInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-input-type-key.util';
import { isFieldMetadataRelationOrMorphRelation } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-field-metadata-relation-or-morph-relation.utils';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Injectable()
export class ObjectMetadataOrderByBaseGenerator {
  constructor(
    private readonly gqlTypesStorage: GqlTypesStorage,
    private readonly relationFieldMetadataGqlInputTypeGenerator: RelationFieldMetadataGqlInputTypeGenerator,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public generateFields({
    objectMetadata,
    logger,
    orderByDateGranularity,
  }: {
    objectMetadata: ObjectMetadataEntity;
    logger: Logger;
    orderByDateGranularity?: boolean;
  }): GraphQLInputFieldConfigMap {
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
          logger,
        );
      } else {
        generatedFields = this.generateAtomicFieldOrderByInputType({
          fieldMetadata,
          typeOptions,
          orderByDateGranularity,
          logger,
        });
      }

      Object.assign(allGeneratedFields, generatedFields);
    }

    return allGeneratedFields;
  }

  private generateCompositeFieldOrderByInputType(
    fieldMetadata: FieldMetadataEntity,
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
    orderByDateGranularity,
  }: {
    fieldMetadata: FieldMetadataEntity;
    typeOptions: TypeOptions;
    logger: Logger;
    orderByDateGranularity?: boolean;
  }) {
    if (
      orderByDateGranularity === true &&
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
