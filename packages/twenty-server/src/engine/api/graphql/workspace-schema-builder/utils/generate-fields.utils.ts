import {
  GraphQLFieldConfigMap,
  GraphQLInputFieldConfigMap,
  GraphQLInputType,
  GraphQLOutputType,
} from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { InputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/factories/input-type-definition.factory';
import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/factories/object-type-definition.factory';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isFieldMetadataInterfaceOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

type TypeFactory<T extends InputTypeDefinitionKind | ObjectTypeDefinitionKind> =
  {
    create: (
      target: string,
      fieldType: FieldMetadataType,
      kind: T,
      options: WorkspaceBuildSchemaOptions,
      additionalOptions: {
        nullable?: boolean;
        defaultValue?: any;
        isArray: boolean;
        settings: any;
        isIdField: boolean;
      },
    ) => T extends InputTypeDefinitionKind
      ? GraphQLInputType
      : GraphQLOutputType;
  };

export const generateFields = <
  T extends InputTypeDefinitionKind | ObjectTypeDefinitionKind,
>(
  objectMetadata: ObjectMetadataInterface,
  kind: T,
  options: WorkspaceBuildSchemaOptions,
  typeFactory: TypeFactory<T>,
  isNewRelationEnabled = false,
): T extends InputTypeDefinitionKind
  ? GraphQLInputFieldConfigMap
  : GraphQLFieldConfigMap<any, any> => {
  const fields = {};

  for (const fieldMetadata of objectMetadata.fields) {
    if (
      isFieldMetadataInterfaceOfType(
        fieldMetadata,
        FieldMetadataType.RELATION,
      ) &&
      (fieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE ||
        !isNewRelationEnabled)
    ) {
      continue;
    }

    const target = isCompositeFieldMetadataType(fieldMetadata.type)
      ? fieldMetadata.type.toString()
      : fieldMetadata.id;

    const typeFactoryOptions = isInputTypeDefinitionKind(kind)
      ? {
          nullable: fieldMetadata.isNullable,
          defaultValue: fieldMetadata.defaultValue,
          isArray:
            kind !== InputTypeDefinitionKind.Filter &&
            fieldMetadata.type === FieldMetadataType.MULTI_SELECT,
          settings: fieldMetadata.settings,
          isIdField: fieldMetadata.name === 'id',
        }
      : {
          nullable: fieldMetadata.isNullable,
          isArray: fieldMetadata.type === FieldMetadataType.MULTI_SELECT,
          settings: fieldMetadata.settings,
          // Scalar type is already defined in the entity itself.
          isIdField: false,
        };

    const type = typeFactory.create(
      target,
      fieldMetadata.type,
      kind,
      options,
      typeFactoryOptions,
    );

    if (
      isFieldMetadataInterfaceOfType(
        fieldMetadata,
        FieldMetadataType.RELATION,
      ) &&
      fieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE
    ) {
      const joinColumnName = fieldMetadata.settings?.joinColumnName;

      if (!joinColumnName) {
        throw new Error('Join column name is not defined');
      }

      fields[joinColumnName] = {
        type,
        description: fieldMetadata.description,
      };
    }

    fields[fieldMetadata.name] = {
      type,
      description: fieldMetadata.description,
    };
  }

  return fields;
};

// Type guard
const isInputTypeDefinitionKind = (
  kind: InputTypeDefinitionKind | ObjectTypeDefinitionKind,
): kind is InputTypeDefinitionKind => {
  return Object.values(InputTypeDefinitionKind).includes(
    kind as InputTypeDefinitionKind,
  );
};
