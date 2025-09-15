import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInputType,
  isEnumType,
  isInputObjectType,
  isObjectType,
} from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { RelationFieldMetadataGqlTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/relation-field-metadata-gql-type.generator';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { computeFieldInputTypeOptions } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-field-input-type-options.util';
import { computeCompositeFieldInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-input-type-key.util';
import { computeEnumFieldGqlTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-enum-field-gql-type-key.util';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';
import { createGqlEnumFilterType } from 'src/engine/api/graphql/workspace-schema-builder/utils/create-gql-enum-filter-type.util';
import { isFieldMetadataRelationOrMorphRelation } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-field-metadata-relation-or-morph-relation.utils';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class ObjectMetadataFilterGqlInputTypeGenerator {
  private readonly logger = new Logger(
    ObjectMetadataFilterGqlInputTypeGenerator.name,
  );
  constructor(
    private readonly gqlTypesStorage: GqlTypesStorage,
    private readonly relationFieldMetadataGqlTypeGenerator: RelationFieldMetadataGqlTypeGenerator,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public buildAndStore(objectMetadata: ObjectMetadataEntity) {
    const inputType = new GraphQLInputObjectType({
      name: `${pascalCase(objectMetadata.nameSingular)}${GqlInputTypeDefinitionKind.Filter.toString()}Input`,
      description: objectMetadata.description,
      fields: () => this.generateFields(objectMetadata, inputType),
    }) as GraphQLInputObjectType;

    const key = computeObjectMetadataInputTypeKey(
      objectMetadata.nameSingular,
      GqlInputTypeDefinitionKind.Filter,
    );

    this.gqlTypesStorage.addGqlType(key, inputType);
  }

  private generateFields(
    objectMetadata: ObjectMetadataEntity,
    inputType: GraphQLInputObjectType,
  ): GraphQLInputFieldConfigMap {
    const andOrType = this.typeMapperService.applyTypeOptions(inputType, {
      isArray: true,
      arrayDepth: 1,
      nullable: true,
    });
    const allGeneratedFields: GraphQLInputFieldConfigMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      fieldMetadata.isNullable = true;

      const typeOptions = computeFieldInputTypeOptions(
        fieldMetadata,
        GqlInputTypeDefinitionKind.Update,
      );

      let generatedFields;

      if (isFieldMetadataRelationOrMorphRelation(fieldMetadata)) {
        generatedFields =
          this.relationFieldMetadataGqlTypeGenerator.generateSimpleRelationFieldFilterInputType(
            {
              fieldMetadata,
              typeOptions,
            },
          );
      } else {
        let type: GraphQLInputType | undefined;

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

          type = createGqlEnumFilterType(enumType);
        } else if (isCompositeFieldMetadataType(fieldMetadata.type)) {
          const key = computeCompositeFieldInputTypeKey(
            fieldMetadata.type,
            GqlInputTypeDefinitionKind.Filter,
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
          type = this.typeMapperService.mapToFilterType(
            fieldMetadata.type,
            typeOptions,
          );

          if (!isDefined(type) || isObjectType(type)) {
            const message = `Could not find a GraphQL input type for ${fieldMetadata.type} field metadata`;

            this.logger.error(message, {
              type,
              typeOptions,
            });
            throw new Error(message);
          }
        }
        //tododo - refacto
        generatedFields = {
          [fieldMetadata.name]: {
            type,
            description: fieldMetadata.description,
          },
        };
      }
      Object.assign(allGeneratedFields, generatedFields);
    }

    return {
      ...allGeneratedFields,
      and: {
        type: andOrType,
      },
      or: {
        type: andOrType,
      },
      not: {
        type: this.typeMapperService.applyTypeOptions(inputType, {
          nullable: true,
        }),
      },
    };
  }
}
