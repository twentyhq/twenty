import { Injectable, Logger } from '@nestjs/common';

import {
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  isEnumType,
  isInputObjectType,
  isObjectType,
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
import { computeEnumFieldGqlTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-enum-field-gql-type-key.util';
import { computeObjectMetadataInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-object-metadata-input-type.util';
import { isFieldMetadataRelationOrMorphRelation } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-field-metadata-relation-or-morph-relation.utils';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

@Injectable()
export class ObjectMetadataCreateGqlInputTypeGenerator {
  private readonly logger = new Logger(
    ObjectMetadataCreateGqlInputTypeGenerator.name,
  );
  constructor(
    private readonly gqlTypesStorage: GqlTypesStorage,
    private readonly relationFieldMetadataGqlInputTypeGenerator: RelationFieldMetadataGqlInputTypeGenerator,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public buildAndStore(objectMetadata: ObjectMetadataEntity) {
    const inputType = new GraphQLInputObjectType({
      name: `${pascalCase(objectMetadata.nameSingular)}${GqlInputTypeDefinitionKind.Create.toString()}Input`,
      description: objectMetadata.description,
      fields: () => this.generateFields(objectMetadata),
    }) as GraphQLInputObjectType;

    const key = computeObjectMetadataInputTypeKey(
      objectMetadata.nameSingular,
      GqlInputTypeDefinitionKind.Create,
    );

    this.gqlTypesStorage.addGqlType(key, inputType);
  }

  private generateFields(
    objectMetadata: ObjectMetadataEntity,
  ): GraphQLInputFieldConfigMap {
    const allGeneratedFields: GraphQLInputFieldConfigMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      const typeOptions = computeFieldInputTypeOptions(
        fieldMetadata,
        GqlInputTypeDefinitionKind.Create,
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
      } else if (isEnumFieldMetadataType(fieldMetadata.type)) {
        generatedFields = this.generateEnumFieldCreateInputType(
          objectMetadata,
          fieldMetadata,
          typeOptions,
        );
      } else if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        generatedFields = this.generateCompositeFieldCreateInputType(
          fieldMetadata,
          typeOptions,
        );
      } else {
        generatedFields = this.generateAtomicFieldCreateInputType(
          fieldMetadata,
          typeOptions,
        );
      }

      Object.assign(allGeneratedFields, generatedFields);
    }

    return allGeneratedFields;
  }

  private generateEnumFieldCreateInputType(
    objectMetadata: ObjectMetadataEntity,
    fieldMetadata: FieldMetadataEntity,
    typeOptions: TypeOptions,
  ) {
    const key = computeEnumFieldGqlTypeKey(
      objectMetadata.nameSingular,
      fieldMetadata.name,
    );

    const enumType = this.gqlTypesStorage.getGqlTypeByKey(key);

    if (!isDefined(enumType) || !isEnumType(enumType)) {
      const message = `Could not find a GraphQL input type for ${fieldMetadata.type} field metadata`;

      this.logger.error(message, {
        fieldMetadata,
        typeOptions,
      });
      throw new Error(message);
    }

    return {
      [fieldMetadata.name]: {
        type: enumType,
        description: fieldMetadata.description,
      },
    };
  }

  private generateCompositeFieldCreateInputType(
    fieldMetadata: FieldMetadataEntity,
    typeOptions: TypeOptions,
  ) {
    const key = computeCompositeFieldInputTypeKey(
      fieldMetadata.type,
      GqlInputTypeDefinitionKind.Create,
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

    return {
      [fieldMetadata.name]: {
        type: compositeType,
        description: fieldMetadata.description,
      },
    };
  }

  private generateAtomicFieldCreateInputType(
    fieldMetadata: FieldMetadataEntity,
    typeOptions: TypeOptions,
  ) {
    const type = this.typeMapperService.mapToScalarType(
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

    return {
      [fieldMetadata.name]: {
        type,
        description: fieldMetadata.description,
      },
    };
  }
}
