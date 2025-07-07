import {
  GraphQLFieldConfigMap,
  GraphQLInputFieldConfigMap,
  GraphQLInputType,
  GraphQLOutputType,
} from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { InputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/factories/input-type-definition.factory';
import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/factories/object-type-definition.factory';
import { formatRelationConnectInputTarget } from 'src/engine/api/graphql/workspace-schema-builder/factories/relation-connect-input-type-definition.factory';
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        defaultValue?: any;
        isArray: boolean;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        settings: any;
        isIdField: boolean;
        isRelationConnectField?: boolean;
      },
    ) => T extends InputTypeDefinitionKind
      ? GraphQLInputType
      : GraphQLOutputType;
  };

export const generateFields = <
  T extends InputTypeDefinitionKind | ObjectTypeDefinitionKind,
>({
  objectMetadata,
  kind,
  options,
  typeFactory,
  isRelationConnectEnabled = false,
}: {
  objectMetadata: ObjectMetadataInterface;
  kind: T;
  options: WorkspaceBuildSchemaOptions;
  typeFactory: TypeFactory<T>;
  isRelationConnectEnabled?: boolean;
}): T extends InputTypeDefinitionKind
  ? GraphQLInputFieldConfigMap
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    GraphQLFieldConfigMap<any, any> => {
  const allGeneratedFields = {};

  for (const fieldMetadata of objectMetadata.fields) {
    let generatedField;

    const isRelation =
      isFieldMetadataInterfaceOfType(
        fieldMetadata,
        FieldMetadataType.RELATION,
      ) ||
      isFieldMetadataInterfaceOfType(
        fieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      );

    if (isRelation) {
      generatedField = generateRelationField({
        fieldMetadata,
        kind,
        options,
        typeFactory,
        isRelationConnectEnabled,
      });
    } else {
      generatedField = generateField({
        fieldMetadata,
        kind,
        options,
        typeFactory,
      });
    }

    Object.assign(allGeneratedFields, generatedField);
  }

  return allGeneratedFields;
};

const getTarget = <T extends FieldMetadataType>(
  fieldMetadata: FieldMetadataInterface<T>,
) => {
  return isCompositeFieldMetadataType(fieldMetadata.type)
    ? fieldMetadata.type.toString()
    : fieldMetadata.id;
};

const getTypeFactoryOptions = <T extends FieldMetadataType>(
  fieldMetadata: FieldMetadataInterface<T>,
  kind: InputTypeDefinitionKind | ObjectTypeDefinitionKind,
) => {
  return isInputTypeDefinitionKind(kind)
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
};

const generateField = <
  T extends InputTypeDefinitionKind | ObjectTypeDefinitionKind,
>({
  fieldMetadata,
  kind,
  options,
  typeFactory,
}: {
  fieldMetadata: FieldMetadataInterface;
  kind: T;
  options: WorkspaceBuildSchemaOptions;
  typeFactory: TypeFactory<T>;
}) => {
  const target = getTarget(fieldMetadata);

  const typeFactoryOptions = getTypeFactoryOptions(fieldMetadata, kind);

  const type = typeFactory.create(
    target,
    fieldMetadata.type,
    kind,
    options,
    typeFactoryOptions,
  );

  return {
    [fieldMetadata.name]: {
      type,
      description: fieldMetadata.description,
    },
  };
};

const generateRelationField = <
  T extends InputTypeDefinitionKind | ObjectTypeDefinitionKind,
>({
  fieldMetadata,
  kind,
  options,
  typeFactory,
  isRelationConnectEnabled,
}: {
  fieldMetadata: FieldMetadataInterface<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >;
  kind: T;
  options: WorkspaceBuildSchemaOptions;
  typeFactory: TypeFactory<T>;
  isRelationConnectEnabled: boolean;
}) => {
  const relationField = {};

  if (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY) {
    return relationField;
  }

  const joinColumnName = fieldMetadata.settings?.joinColumnName;

  if (!joinColumnName) {
    throw new Error('Join column name is not defined');
  }

  const target = getTarget(fieldMetadata);
  const typeFactoryOptions = getTypeFactoryOptions(fieldMetadata, kind);

  let type = typeFactory.create(
    target,
    fieldMetadata.type,
    kind,
    options,
    typeFactoryOptions,
  );

  // @ts-expect-error legacy noImplicitAny
  relationField[joinColumnName] = {
    type,
    description: fieldMetadata.description,
  };

  if (
    [InputTypeDefinitionKind.Create, InputTypeDefinitionKind.Update].includes(
      kind as InputTypeDefinitionKind,
    ) &&
    isDefined(fieldMetadata.relationTargetObjectMetadataId) &&
    isRelationConnectEnabled
  ) {
    type = typeFactory.create(
      formatRelationConnectInputTarget(
        fieldMetadata.relationTargetObjectMetadataId,
      ),
      fieldMetadata.type,
      kind,
      options,
      {
        ...typeFactoryOptions,
        isRelationConnectField: true,
      },
    );
  }

  // @ts-expect-error legacy noImplicitAny
  relationField[fieldMetadata.name] = {
    type: type,
    description: fieldMetadata.description,
  };

  return relationField;
};

// Type guard
const isInputTypeDefinitionKind = (
  kind: InputTypeDefinitionKind | ObjectTypeDefinitionKind,
): kind is InputTypeDefinitionKind => {
  return Object.values(InputTypeDefinitionKind).includes(
    kind as InputTypeDefinitionKind,
  );
};
