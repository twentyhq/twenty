import { Injectable } from '@nestjs/common';

import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql';
import { FieldMetadataType } from 'twenty-shared/types';

import { StoredInputType } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/stored-gql-type.interface';
import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { InputTypeDefinitionKind } from 'src/engine/api/graphql/workspace-schema-builder/enums/input-type-definition-kind.enum';
import { FieldInputTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/field-input-type.generator';
import { RelationFieldTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/relation-field-type.generator';
import {
  TypeMapperService,
  TypeOptions,
} from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';
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
export class ObjectMetadataInputTypeGenerator {
  constructor(
    private readonly fieldInputTypeGenerator: FieldInputTypeGenerator,
    private readonly typeMapperService: TypeMapperService,
    private readonly relationFieldTypeGenerator: RelationFieldTypeGenerator,
  ) {}

  public generate(
    objectMetadata: ObjectMetadataEntity,
    options: WorkspaceBuildSchemaOptions,
  ): StoredInputType[] {
    const extendedObjectMetadata = {
      ...objectMetadata,
      fields: objectMetadata.fields.map((field) => ({
        ...field,
        isNullable: true,
      })),
    };

    return Object.values(InputTypeDefinitionKind).map((kind) =>
      this.generateObjectMetadataInputType(
        kind === InputTypeDefinitionKind.Create
          ? objectMetadata
          : extendedObjectMetadata,
        kind,
        options,
      ),
    );
  }

  private generateObjectMetadataInputType(
    objectMetadata: ObjectMetadataEntity,
    kind: InputTypeDefinitionKind,
    options: WorkspaceBuildSchemaOptions,
  ): StoredInputType {
    const inputType = new GraphQLInputObjectType({
      name: `${pascalCase(objectMetadata.nameSingular)}${kind.toString()}Input`,
      description: objectMetadata.description,
      fields: () =>
        this.generateFields({ objectMetadata, options, kind, inputType }),
    }) as GraphQLInputObjectType;

    return {
      key: computeObjectMetadataInputTypeKey(objectMetadata.nameSingular, kind),
      type: inputType,
    };
  }

  private generateFields({
    objectMetadata,
    options,
    inputType,
    kind,
  }: {
    objectMetadata: ObjectMetadataEntity;
    options: WorkspaceBuildSchemaOptions;
    inputType: GraphQLInputObjectType;
    kind: InputTypeDefinitionKind;
  }): GraphQLInputFieldConfigMap {
    switch (kind) {
      case InputTypeDefinitionKind.Filter:
        return this.generateObjectMetadataFilterInputTypeField({
          objectMetadata,
          options,
          inputType,
        });
      case InputTypeDefinitionKind.Create:
      case InputTypeDefinitionKind.Update:
        return this.generateObjectMetadataCreateOrUpdateInputTypeFields({
          objectMetadata,
          options,
          kind,
        });
      case InputTypeDefinitionKind.OrderBy:
        return this.generateObjectMetadataOrderByInputTypeField({
          objectMetadata,
          options,
        });
      default:
        throw new Error(`Invalid input type kind: ${kind}`);
    }
  }

  private getTypeFactoryOptions<T extends FieldMetadataType>(
    fieldMetadata: FieldMetadataEntity<T>,
    kind: InputTypeDefinitionKind,
  ): TypeOptions {
    return {
      nullable: fieldMetadata.isNullable ?? undefined,
      defaultValue: fieldMetadata.defaultValue,
      isArray:
        kind !== InputTypeDefinitionKind.Filter &&
        fieldMetadata.type === FieldMetadataType.MULTI_SELECT,
      settings: fieldMetadata.settings,
      isIdField: fieldMetadata.name === 'id',
    };
  }

  private computeFieldTypeKey(
    objectMetadata: ObjectMetadataEntity,
    fieldMetadata: FieldMetadataEntity,
    kind: InputTypeDefinitionKind,
  ): string | undefined {
    if (isEnumFieldMetadataType(fieldMetadata.type))
      return computeEnumFieldGqlTypeKey(
        objectMetadata.nameSingular,
        fieldMetadata.name,
      );

    if (isCompositeFieldMetadataType(fieldMetadata.type))
      return computeCompositeFieldInputTypeKey(fieldMetadata.type, kind);

    return undefined;
  }

  private generateObjectMetadataFilterInputTypeField({
    objectMetadata,
    options,
    inputType,
  }: {
    objectMetadata: ObjectMetadataEntity;
    options: WorkspaceBuildSchemaOptions;
    inputType: GraphQLInputObjectType;
  }): GraphQLInputFieldConfigMap {
    const andOrType = this.typeMapperService.mapToGqlType(inputType, {
      isArray: true,
      arrayDepth: 1,
      nullable: true,
    });

    const allGeneratedFields = {};

    for (const fieldMetadata of objectMetadata.fields) {
      const typeOptions = this.getTypeFactoryOptions(
        fieldMetadata,
        InputTypeDefinitionKind.Filter,
      );

      let generatedField;

      if (isFieldMetadataRelationOrMorphRelation(fieldMetadata)) {
        generatedField =
          this.relationFieldTypeGenerator.generateRelationFieldInputType({
            fieldMetadata,
            kind: InputTypeDefinitionKind.Filter,
            buildOptions: options,
            typeOptions,
          });
      } else {
        const type = this.fieldInputTypeGenerator.generate({
          type: fieldMetadata.type,
          kind: InputTypeDefinitionKind.Filter,
          buildOptions: options,
          typeOptions,
          key: this.computeFieldTypeKey(
            objectMetadata,
            fieldMetadata,
            InputTypeDefinitionKind.Filter,
          ),
        });

        generatedField = {
          [fieldMetadata.name]: {
            type,
            description: fieldMetadata.description,
          },
        };
      }
      Object.assign(allGeneratedFields, generatedField);
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
        type: this.typeMapperService.mapToGqlType(inputType, {
          nullable: true,
        }),
      },
    };
  }

  private generateObjectMetadataCreateOrUpdateInputTypeFields({
    objectMetadata,
    options,
    kind,
  }: {
    objectMetadata: ObjectMetadataEntity;
    options: WorkspaceBuildSchemaOptions;
    kind: InputTypeDefinitionKind;
  }): GraphQLInputFieldConfigMap {
    const allGeneratedFields: GraphQLInputFieldConfigMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      const typeOptions = this.getTypeFactoryOptions(fieldMetadata, kind);

      let generatedFields;

      if (isFieldMetadataRelationOrMorphRelation(fieldMetadata)) {
        generatedFields =
          this.relationFieldTypeGenerator.generateRelationFieldInputType({
            fieldMetadata,
            kind,
            buildOptions: options,
            typeOptions,
          });
      } else {
        const type = this.fieldInputTypeGenerator.generate({
          type: fieldMetadata.type,
          kind,
          buildOptions: options,
          typeOptions,
          key: this.computeFieldTypeKey(objectMetadata, fieldMetadata, kind),
        });

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

  private generateObjectMetadataOrderByInputTypeField({
    objectMetadata,
    options,
  }: {
    objectMetadata: ObjectMetadataEntity;
    options: WorkspaceBuildSchemaOptions;
  }): GraphQLInputFieldConfigMap {
    const allGeneratedFields = {};

    for (const fieldMetadata of objectMetadata.fields) {
      const typeOptions = this.getTypeFactoryOptions(
        fieldMetadata,
        InputTypeDefinitionKind.OrderBy,
      );

      let generatedField;

      if (isFieldMetadataRelationOrMorphRelation(fieldMetadata)) {
        generatedField =
          this.relationFieldTypeGenerator.generateRelationFieldInputType({
            fieldMetadata,
            kind: InputTypeDefinitionKind.OrderBy,
            buildOptions: options,
            typeOptions,
          });
      } else {
        const type = this.fieldInputTypeGenerator.generate({
          type: fieldMetadata.type,
          kind: InputTypeDefinitionKind.OrderBy,
          buildOptions: options,
          typeOptions,
          key: this.computeFieldTypeKey(
            objectMetadata,
            fieldMetadata,
            InputTypeDefinitionKind.OrderBy,
          ),
        });

        generatedField = {
          [fieldMetadata.name]: {
            type,
            description: fieldMetadata.description,
          },
        };
      }
      Object.assign(allGeneratedFields, generatedField);
    }

    return allGeneratedFields;
  }
}
