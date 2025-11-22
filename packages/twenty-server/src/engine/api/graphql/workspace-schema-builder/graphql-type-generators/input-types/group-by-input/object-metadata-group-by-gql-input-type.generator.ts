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
import { computeCompositeFieldInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-input-type-key.util';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';
import { isFieldMetadataRelationOrMorphRelation } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-field-metadata-relation-or-morph-relation.utils';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { generateObjectMetadataMaps } from 'src/engine/metadata-modules/utils/generate-object-metadata-maps.util';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class ObjectMetadataGroupByGqlInputTypeGenerator {
  private readonly logger = new Logger(
    ObjectMetadataGroupByGqlInputTypeGenerator.name,
  );
  private objectMetadataCollection: ObjectMetadataEntity[] = [];
  private objectMetadataMaps: ObjectMetadataMaps | undefined;

  constructor(
    private readonly gqlTypesStorage: GqlTypesStorage,
    private readonly relationFieldMetadataGqlInputTypeGenerator: RelationFieldMetadataGqlInputTypeGenerator,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public buildAndStore(
    objectMetadata: ObjectMetadataEntity,
    objectMetadataCollection?: ObjectMetadataEntity[],
  ) {
    if (isDefined(objectMetadataCollection)) {
      this.objectMetadataCollection = objectMetadataCollection;
      this.objectMetadataMaps = generateObjectMetadataMaps(
        objectMetadataCollection,
      );
    }

    const inputType = new GraphQLInputObjectType({
      name: `${pascalCase(objectMetadata.nameSingular)}${GqlInputTypeDefinitionKind.GroupBy.toString()}Input`,
      description: objectMetadata.description,
      fields: () => this.generateFields(objectMetadata),
    }) as GraphQLInputObjectType;

    const key = computeObjectMetadataInputTypeKey(
      objectMetadata.nameSingular,
      GqlInputTypeDefinitionKind.GroupBy,
    );

    this.gqlTypesStorage.addGqlType(key, inputType);
  }

  private generateFields(
    objectMetadata: ObjectMetadataEntity,
  ): GraphQLInputFieldConfigMap {
    const allGeneratedFields: GraphQLInputFieldConfigMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      const generatedField = isFieldMetadataRelationOrMorphRelation(
        fieldMetadata,
      )
        ? this.relationFieldMetadataGqlInputTypeGenerator.generateSimpleRelationFieldGroupByInputType(
            fieldMetadata,
            this.objectMetadataMaps,
          )
        : this.generateField(fieldMetadata);

      Object.assign(allGeneratedFields, generatedField);
    }

    return allGeneratedFields;
  }

  private generateField(fieldMetadata: FieldMetadataEntity) {
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
    fieldMetadata: FieldMetadataEntity,
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
