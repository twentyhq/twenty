import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLBoolean,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLUnionType,
  isInputObjectType,
} from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { GROUP_BY_DATE_GRANULARITY_INPUT_KEY } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/group-by-input/group-by-date-granularity-gql-input-type.generator';
import { RelationFieldMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/relation-field-metadata-gql-type.generator';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { computeCompositeFieldInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-input-type-key.util';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class ObjectMetadataGroupByGqlInputTypeGenerator {
  private readonly logger = new Logger(
    ObjectMetadataGroupByGqlInputTypeGenerator.name,
  );

  constructor(
    private readonly gqlTypesStorage: GqlTypesStorage,
    private readonly relationFieldMetadataGqlInputTypeGenerator: RelationFieldMetadataGqlInputTypeGenerator,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public buildAndStore(
    flatObjectMetadata: FlatObjectMetadata,
    fields: FlatFieldMetadata[],
    context: SchemaGenerationContext,
  ) {
    const inputType = new GraphQLInputObjectType({
      name: `${pascalCase(flatObjectMetadata.nameSingular)}${GqlInputTypeDefinitionKind.GroupBy.toString()}Input`,
      description: flatObjectMetadata.description,
      fields: () => this.generateFields(fields, context),
    }) as GraphQLInputObjectType;

    const key = computeObjectMetadataInputTypeKey(
      flatObjectMetadata.nameSingular,
      GqlInputTypeDefinitionKind.GroupBy,
    );

    this.gqlTypesStorage.addGqlType(key, inputType);
  }

  private generateFields(
    fields: FlatFieldMetadata[],
    context: SchemaGenerationContext,
  ): GraphQLInputFieldConfigMap {
    const allGeneratedFields: GraphQLInputFieldConfigMap = {};

    for (const fieldMetadata of fields) {
      const generatedField = isMorphOrRelationFlatFieldMetadata(fieldMetadata)
        ? this.relationFieldMetadataGqlInputTypeGenerator.generateSimpleRelationFieldGroupByInputType(
            fieldMetadata,
            context,
          )
        : this.generateField(fieldMetadata);

      Object.assign(allGeneratedFields, generatedField);
    }

    return allGeneratedFields;
  }

  private generateField(fieldMetadata: FlatFieldMetadata) {
    if (isCompositeFieldMetadataType(fieldMetadata.type))
      return this.generateCompositeFieldGroupByInputType(fieldMetadata);

    let type: GraphQLInputType | GraphQLUnionType;

    if (
      fieldMetadata.type === FieldMetadataType.DATE ||
      fieldMetadata.type === FieldMetadataType.DATE_TIME
    ) {
      const groupByDateGranularityInputType =
        this.gqlTypesStorage.getGqlTypeByKey(
          GROUP_BY_DATE_GRANULARITY_INPUT_KEY,
        );

      if (
        !isDefined(groupByDateGranularityInputType) ||
        !isInputObjectType(groupByDateGranularityInputType)
      ) {
        throw new Error(
          'Could not find a GraphQL input type for GroupByDateGranularityInput',
        );
      }

      type = groupByDateGranularityInputType;
    } else {
      type = this.typeMapperService.applyTypeOptions(GraphQLBoolean, {});
    }

    return {
      [fieldMetadata.name]: {
        type,
        description: fieldMetadata.description,
      },
    };
  }

  private generateCompositeFieldGroupByInputType(
    fieldMetadata: FlatFieldMetadata,
  ) {
    const key = computeCompositeFieldInputTypeKey(
      fieldMetadata.type,
      GqlInputTypeDefinitionKind.GroupBy,
    );

    const compositeType = this.gqlTypesStorage.getGqlTypeByKey(key);

    if (!isDefined(compositeType) || !isInputObjectType(compositeType)) {
      const message = `Could not find a GraphQL input type for ${fieldMetadata.type} field metadata`;

      this.logger.error(message, {
        fieldMetadata,
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
}
