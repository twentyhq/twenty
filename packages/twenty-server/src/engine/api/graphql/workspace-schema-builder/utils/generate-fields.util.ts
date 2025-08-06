import {
  GraphQLFieldConfigMap,
  GraphQLInputFieldConfigMap,
  GraphQLInputType,
  GraphQLOutputType,
} from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { InputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/factories/input-type-definition.factory';
import { ObjectTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/factories/object-type-definition.factory';
import { formatRelationConnectInputTarget } from 'src/engine/api/graphql/workspace-schema-builder/factories/relation-connect-input-type-definition.factory';
import { extractGraphQLRelationFieldNames } from 'src/engine/api/graphql/workspace-schema-builder/utils/extract-graphql-relation-field-names.util';
import { isFieldMetadataRelationOrMorphRelation } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-field-metadata-relation-or-morph-relation.utils';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

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
}: {
  objectMetadata: ObjectMetadataEntity;
  kind: T;
  options: WorkspaceBuildSchemaOptions;
  typeFactory: TypeFactory<T>;
}): T extends InputTypeDefinitionKind
  ? GraphQLInputFieldConfigMap
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    GraphQLFieldConfigMap<any, any> => {
  const allGeneratedFields = {};

  for (const fieldMetadata of objectMetadata.fields) {
    let generatedField;

    const isRelation = isFieldMetadataRelationOrMorphRelation(fieldMetadata);

    if (isRelation) {
      generatedField = generateRelationField({
        fieldMetadata: fieldMetadata as FieldMetadataEntity<
          FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
        >,
        kind,
        options,
        typeFactory,
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
  fieldMetadata: FieldMetadataEntity<T>,
) => {
  return isCompositeFieldMetadataType(fieldMetadata.type)
    ? fieldMetadata.type.toString()
    : fieldMetadata.id;
};

const getTypeFactoryOptions = <T extends FieldMetadataType>(
  fieldMetadata: FieldMetadataEntity<T>,
  kind: InputTypeDefinitionKind | ObjectTypeDefinitionKind,
) => {
  return isInputTypeDefinitionKind(kind)
    ? {
        nullable: fieldMetadata.isNullable ?? undefined,
        defaultValue: fieldMetadata.defaultValue,
        isArray:
          kind !== InputTypeDefinitionKind.Filter &&
          fieldMetadata.type === FieldMetadataType.MULTI_SELECT,
        settings: fieldMetadata.settings,
        isIdField: fieldMetadata.name === 'id',
      }
    : {
        nullable: fieldMetadata.isNullable ?? undefined,
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
  fieldMetadata: FieldMetadataEntity;
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
}: {
  fieldMetadata: FieldMetadataEntity<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >;
  kind: T;
  options: WorkspaceBuildSchemaOptions;
  typeFactory: TypeFactory<T>;
}) => {
  const relationField = {};

  if (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY) {
    return relationField;
  }

  const { joinColumnName, fieldMetadataName } =
    extractGraphQLRelationFieldNames(fieldMetadata);

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

  //TODO : temporary - continue ej/1278 branch (https://github.com/twentyhq/core-team-issues/issues/1278 issue) before removing this
  if (fieldMetadata.type === FieldMetadataType.MORPH_RELATION)
    return relationField;

  if (
    [InputTypeDefinitionKind.Create, InputTypeDefinitionKind.Update].includes(
      kind as InputTypeDefinitionKind,
    ) &&
    isDefined(fieldMetadata.relationTargetObjectMetadataId)
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
  relationField[fieldMetadataName] = {
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
