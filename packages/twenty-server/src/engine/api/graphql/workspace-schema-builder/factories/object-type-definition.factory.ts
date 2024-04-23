import { Injectable } from '@nestjs/common';

import { GraphQLFieldConfigMap, GraphQLObjectType } from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { pascalCase } from 'src/utils/pascal-case';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';

import { OutputTypeFactory } from './output-type.factory';

export enum ObjectTypeDefinitionKind {
  Connection = 'Connection',
  Edge = 'Edge',
  Plain = '',
}

export interface ObjectTypeDefinition {
  target: string;
  kind: ObjectTypeDefinitionKind;
  type: GraphQLObjectType;
}

@Injectable()
export class ObjectTypeDefinitionFactory {
  constructor(private readonly outputTypeFactory: OutputTypeFactory) {}

  public create(
    objectMetadata: ObjectMetadataInterface,
    kind: ObjectTypeDefinitionKind,
    options: WorkspaceBuildSchemaOptions,
  ): ObjectTypeDefinition {
    return {
      target: objectMetadata.id,
      kind,
      type: new GraphQLObjectType({
        name: `${pascalCase(objectMetadata.nameSingular)}${kind.toString()}`,
        description: objectMetadata.description,
        fields: this.generateFields(objectMetadata, kind, options),
      }),
    };
  }

  private generateFields(
    objectMetadata: ObjectMetadataInterface,
    kind: ObjectTypeDefinitionKind,
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLFieldConfigMap<any, any> {
    const fields: GraphQLFieldConfigMap<any, any> = {};

    for (const fieldMetadata of objectMetadata.fields) {
      // Relation field types are generated during extension of object type definition
      if (isRelationFieldMetadataType(fieldMetadata.type)) {
        continue;
      }

      const target = isCompositeFieldMetadataType(fieldMetadata.type)
        ? fieldMetadata.type.toString()
        : fieldMetadata.id;

      const type = this.outputTypeFactory.create(
        target,
        fieldMetadata.type,
        kind,
        options,
        {
          nullable: fieldMetadata.isNullable,
          isArray: fieldMetadata.type === FieldMetadataType.MULTI_SELECT,
          settings: fieldMetadata.settings,
          // isIdField: fieldMetadata.name === 'id',
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
