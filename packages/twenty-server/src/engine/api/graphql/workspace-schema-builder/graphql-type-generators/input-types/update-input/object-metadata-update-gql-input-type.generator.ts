import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLEnumType,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLScalarType,
  isEnumType,
  isInputObjectType,
  isObjectType,
} from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { RelationFieldMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/relation-field-metadata-gql-type.generator';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { computeFieldInputTypeOptions } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-field-input-type-options.util';
import { computeCompositeFieldInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-input-type-key.util';
import { computeEnumFieldGqlTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-enum-field-gql-type-key.util';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class ObjectMetadataUpdateGqlInputTypeGenerator {
  private readonly logger = new Logger(
    ObjectMetadataUpdateGqlInputTypeGenerator.name,
  );
  constructor(
    private readonly gqlTypesStorage: GqlTypesStorage,
    private readonly relationFieldMetadataGqlInputTypeGenerator: RelationFieldMetadataGqlInputTypeGenerator,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public buildAndStore(
    flatObjectMetadata: FlatObjectMetadata,
    fields: FlatFieldMetadata[],
    _context: SchemaGenerationContext,
  ) {
    const inputType = new GraphQLInputObjectType({
      name: `${pascalCase(flatObjectMetadata.nameSingular)}${GqlInputTypeDefinitionKind.Update.toString()}Input`,
      description: flatObjectMetadata.description,
      fields: () =>
        this.generateFields(flatObjectMetadata.nameSingular, fields),
    }) as GraphQLInputObjectType;

    const key = computeObjectMetadataInputTypeKey(
      flatObjectMetadata.nameSingular,
      GqlInputTypeDefinitionKind.Update,
    );

    this.gqlTypesStorage.addGqlType(key, inputType);
  }

  private generateFields(
    objectNameSingular: string,
    fields: FlatFieldMetadata[],
  ): GraphQLInputFieldConfigMap {
    const allGeneratedFields: GraphQLInputFieldConfigMap = {};

    for (const fieldMetadata of fields) {
      const modifiedFieldMetadata = {
        ...fieldMetadata,
        isNullable: true,
      };

      const typeOptions = computeFieldInputTypeOptions(
        modifiedFieldMetadata,
        GqlInputTypeDefinitionKind.Update,
      );

      let generatedFields;

      if (isMorphOrRelationFlatFieldMetadata(fieldMetadata)) {
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
          | undefined;

        if (isEnumFieldMetadataType(fieldMetadata.type)) {
          const key = computeEnumFieldGqlTypeKey(
            objectNameSingular,
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
            GqlInputTypeDefinitionKind.Update,
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
          type = this.typeMapperService.mapToScalarType(
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

        const modifiedType = this.typeMapperService.applyTypeOptions(
          type,
          typeOptions,
        );

        generatedFields = {
          [fieldMetadata.name]: {
            type: modifiedType,
            description: fieldMetadata.description,
          },
        };
      }
      Object.assign(allGeneratedFields, generatedFields);
    }

    return allGeneratedFields;
  }
}
