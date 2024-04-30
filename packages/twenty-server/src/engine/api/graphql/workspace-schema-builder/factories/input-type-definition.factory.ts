import { Inject, Injectable, forwardRef } from '@nestjs/common';

import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { pascalCase } from 'src/utils/pascal-case';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { TypeMapperService } from 'src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service';

import { InputTypeFactory } from './input-type.factory';

export enum InputTypeDefinitionKind {
  Create = 'Create',
  Update = 'Update',
  Filter = 'Filter',
  OrderBy = 'OrderBy',
}

export interface InputTypeDefinition {
  target: string;
  kind: InputTypeDefinitionKind;
  type: GraphQLInputObjectType;
}

@Injectable()
export class InputTypeDefinitionFactory {
  constructor(
    @Inject(forwardRef(() => InputTypeFactory))
    private readonly inputTypeFactory: CircularDep<InputTypeFactory>,
    private readonly typeMapperService: TypeMapperService,
  ) {}

  public create(
    objectMetadata: ObjectMetadataInterface,
    kind: InputTypeDefinitionKind,
    options: WorkspaceBuildSchemaOptions,
  ): InputTypeDefinition {
    const inputType = new GraphQLInputObjectType({
      name: `${pascalCase(objectMetadata.nameSingular)}${kind.toString()}Input`,
      description: objectMetadata.description,
      fields: () => {
        switch (kind) {
          /**
           * Filter input type has additional fields for filtering and is self referencing
           */
          case InputTypeDefinitionKind.Filter: {
            const andOrType = this.typeMapperService.mapToGqlType(inputType, {
              isArray: true,
              arrayDepth: 1,
              nullable: true,
            });

            return {
              ...this.generateFields(objectMetadata, kind, options),
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
          /**
           * Other input types are generated with fields only
           */
          default:
            return this.generateFields(objectMetadata, kind, options);
        }
      },
    });

    return {
      target: objectMetadata.id,
      kind,
      type: inputType,
    };
  }

  private generateFields(
    objectMetadata: ObjectMetadataInterface,
    kind: InputTypeDefinitionKind,
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLInputFieldConfigMap {
    const fields: GraphQLInputFieldConfigMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      // Relation field types are generated during extension of object type definition
      if (isRelationFieldMetadataType(fieldMetadata.type)) {
        continue;
      }

      const target = isCompositeFieldMetadataType(fieldMetadata.type)
        ? fieldMetadata.type.toString()
        : fieldMetadata.id;

      const isIdField = fieldMetadata.name === 'id';

      const type = this.inputTypeFactory.create(
        target,
        fieldMetadata.type,
        kind,
        options,
        {
          nullable: fieldMetadata.isNullable,
          defaultValue: fieldMetadata.defaultValue,
          isArray: fieldMetadata.type === FieldMetadataType.MULTI_SELECT,
          settings: fieldMetadata.settings,
          isIdField,
        },
      );

      fields[fieldMetadata.name] = {
        type,
        description: fieldMetadata.description,
      };
    }

    return fields;
  }
}
