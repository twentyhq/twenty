import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLList,
  isEnumType,
  isInputObjectType,
  isObjectType,
} from 'graphql';
import { isDefined, pascalCase } from 'twenty-shared/utils';

import { GqlInputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-input-type-definition-kind.enum';
import { RelationFieldMetadataGqlInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/graphql-type-generators/input-types/relation-field-metadata-gql-type.generator';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
import { GqlTypesStorage } from 'src/engine/api/graphql/workspace-schema-builder/storages/gql-types.storage';
import { type SchemaGenerationContext } from 'src/engine/api/graphql/workspace-schema-builder/types/schema-generation-context.type';
import { computeFieldInputTypeOptions } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-field-input-type-options.util';
import { computeCompositeFieldInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-composite-field-input-type-key.util';
import { computeEnumFieldGqlTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-enum-field-gql-type-key.util';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';
import { createGqlEnumFilterType } from 'src/engine/api/graphql/workspace-schema-builder/utils/create-gql-enum-filter-type.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

@Injectable()
export class ObjectMetadataFilterGqlInputTypeGenerator {
  private readonly logger = new Logger(
    ObjectMetadataFilterGqlInputTypeGenerator.name,
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
      name: `${pascalCase(flatObjectMetadata.nameSingular)}${GqlInputTypeDefinitionKind.Filter.toString()}Input`,
      description: flatObjectMetadata.description,
      fields: () =>
        this.generateFields(
          flatObjectMetadata.nameSingular,
          fields,
          inputType,
          context,
        ),
    }) as GraphQLInputObjectType;

    const key = computeObjectMetadataInputTypeKey(
      flatObjectMetadata.nameSingular,
      GqlInputTypeDefinitionKind.Filter,
    );

    this.gqlTypesStorage.addGqlType(key, inputType);
  }

  private generateFields(
    objectNameSingular: string,
    fields: FlatFieldMetadata[],
    inputType: GraphQLInputObjectType,
    context: SchemaGenerationContext,
  ): GraphQLInputFieldConfigMap {
    const allGeneratedFields: GraphQLInputFieldConfigMap = {};

    for (const fieldMetadata of fields) {
      const modifiedFieldMetadata = {
        ...fieldMetadata,
        isNullable: true,
      };

      const typeOptions = computeFieldInputTypeOptions(
        modifiedFieldMetadata,
        GqlInputTypeDefinitionKind.Filter,
      );

      let generatedFields;

      if (isMorphOrRelationFlatFieldMetadata(fieldMetadata)) {
        generatedFields =
          this.relationFieldMetadataGqlInputTypeGenerator.generateSimpleRelationFieldFilterInputType(
            {
              fieldMetadata,
              typeOptions,
              context,
            },
          );
      } else if (isEnumFieldMetadataType(fieldMetadata.type)) {
        generatedFields = this.generateEnumFieldFilterInputType(
          objectNameSingular,
          fieldMetadata,
        );
      } else if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        generatedFields =
          this.generateCompositeFieldFilterInputType(fieldMetadata);
      } else {
        generatedFields = this.generateAtomicFieldFilterInputType(
          fieldMetadata,
          typeOptions,
        );
      }
      Object.assign(allGeneratedFields, generatedFields);
    }

    return {
      ...allGeneratedFields,
      and: {
        type: new GraphQLList(inputType),
      },
      or: {
        type: new GraphQLList(inputType),
      },
      not: {
        type: inputType,
      },
    };
  }

  private generateEnumFieldFilterInputType(
    objectNameSingular: string,
    fieldMetadata: FlatFieldMetadata,
  ) {
    const key = computeEnumFieldGqlTypeKey(
      objectNameSingular,
      fieldMetadata.name,
    );

    const enumType = this.gqlTypesStorage.getGqlTypeByKey(key);

    if (!isDefined(enumType) || !isEnumType(enumType)) {
      const message = `Could not find a GraphQL input type for ${fieldMetadata.type} field metadata`;

      this.logger.error(message, {
        fieldMetadata,
      });
      throw new Error(message);
    }

    const type = createGqlEnumFilterType(enumType);

    return {
      [fieldMetadata.name]: {
        type,
        description: fieldMetadata.description,
      },
    };
  }

  private generateCompositeFieldFilterInputType(
    fieldMetadata: FlatFieldMetadata,
  ) {
    const key = computeCompositeFieldInputTypeKey(
      fieldMetadata.type,
      GqlInputTypeDefinitionKind.Filter,
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

  private generateAtomicFieldFilterInputType(
    fieldMetadata: FlatFieldMetadata,
    typeOptions: { settings?: FlatFieldMetadata['settings'] },
  ) {
    const type = this.typeMapperService.mapToFilterType(
      fieldMetadata.type,
      typeOptions,
    );

    if (!isDefined(type) || isObjectType(type)) {
      const message = `Could not find a GraphQL input type for ${fieldMetadata.type} field metadata`;

      this.logger.error(message, {
        fieldMetadata,
        typeOptions,
      });
      throw new Error(message);
    }

    return {
      [fieldMetadata.name]: {
        type,
        description: fieldMetadata.description,
      },
    };
  }
}
