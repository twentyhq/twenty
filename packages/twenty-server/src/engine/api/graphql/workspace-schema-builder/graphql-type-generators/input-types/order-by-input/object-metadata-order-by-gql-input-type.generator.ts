import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLEnumType,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLList,
  GraphQLScalarType,
  isEnumType,
  isInputObjectType,
} from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { RelationFieldMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/relation-field-metadata-gql-type.generator';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { computeFieldInputTypeOptions } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-field-input-type-options.util';
import { computeCompositeFieldInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-input-type-key.util';
import { computeEnumFieldGqlTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-enum-field-gql-type-key.util';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';
import { isFieldMetadataRelationOrMorphRelation } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-field-metadata-relation-or-morph-relation.utils';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
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

  public buildAndStore(objectMetadata: ObjectMetadataEntity) {
    const inputType = new GraphQLInputObjectType({
      name: `${pascalCase(objectMetadata.nameSingular)}${GqlInputTypeDefinitionKind.OrderBy.toString()}Input`,
      description: objectMetadata.description,
      fields: () => this.generateFields(objectMetadata),
    }) as GraphQLInputObjectType;

    const key = computeObjectMetadataInputTypeKey(
      objectMetadata.nameSingular,
      GqlInputTypeDefinitionKind.OrderBy,
    );

    this.gqlTypesStorage.addGqlType(key, inputType);
  }

  private generateFields(
    objectMetadata: ObjectMetadataEntity,
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
        generatedFields = {
          ...this.relationFieldMetadataGqlInputTypeGenerator.generateSimpleRelationFieldCreateOrUpdateInputType(
            {
              fieldMetadata,
              typeOptions,
            },
          ),
          ...this.relationFieldMetadataGqlInputTypeGenerator.generateConnectRelationFieldInputType(
            {
              fieldMetadata,
              typeOptions,
            },
          ),
        };
      } else {
        let type:
          | GraphQLInputObjectType
          | GraphQLEnumType
          | GraphQLScalarType
          | GraphQLList<GraphQLInputType>
          | undefined;

        if (isEnumFieldMetadataType(fieldMetadata.type)) {
          const key = computeEnumFieldGqlTypeKey(
            objectMetadata.nameSingular,
            fieldMetadata.name,
          );

          const enumType = this.gqlTypesStorage.getGqlTypeByKey(key);

          if (!isDefined(enumType) || !isEnumType(enumType)) {
            const message = `Could not find a GraphQL input type for ${fieldMetadata.type} field metadata`;

            this.logger.error(message, {
              type,
              typeOptions,
            });
            throw new Error(message);
          }

          type = enumType;
        } else if (isCompositeFieldMetadataType(fieldMetadata.type)) {
          const key = computeCompositeFieldInputTypeKey(
            fieldMetadata.type,
            GqlInputTypeDefinitionKind.OrderBy,
          );

          const compositeType = this.gqlTypesStorage.getGqlTypeByKey(key);

          if (!isDefined(compositeType) || !isInputObjectType(compositeType)) {
            const message = `Could not find a GraphQL input type for ${fieldMetadata.type} field metadata`;

            this.logger.error(message, {
              type,
              typeOptions,
            });
            throw new Error(message);
          }

          type = compositeType;
        } else {
          const orderByType = this.typeMapperService.mapToOrderByType(
            fieldMetadata.type,
          );

          if (!isDefined(orderByType)) {
            const message = `Could not find a GraphQL input type for ${fieldMetadata.type} field metadata`;

            this.logger.error(message, {
              type,
              typeOptions,
            });
            throw new Error(message);
          }

          type = orderByType;
        }
        generatedFields = {
          [fieldMetadata.name]: {
            type,
            description: fieldMetadata.description,
          },
        };
      }
      Object.assign(allGeneratedFields, generatedFields);
    }

    return allGeneratedFields;
  }
}
