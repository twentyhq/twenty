import { Injectable } from '@nestjs/common';

import { GraphQLInputFieldConfigMap, GraphQLInputObjectType } from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { pascalCase } from 'src/utils/pascal-case';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';

import {
  InputTypeDefinition,
  InputTypeDefinitionKind,
} from './input-type-definition.factory';
import { OrderByTypeFactory } from './order-by-type.factory';

@Injectable()
export class OrderByTypeDefinitionFactory {
  constructor(private readonly orderByTypeFactory: OrderByTypeFactory) {}

  public create(
    objectMetadata: ObjectMetadataInterface,
    options: WorkspaceBuildSchemaOptions,
  ): InputTypeDefinition {
    const kind = InputTypeDefinitionKind.OrderBy;

    return {
      target: objectMetadata.id,
      kind,
      type: new GraphQLInputObjectType({
        name: `${pascalCase(
          objectMetadata.nameSingular,
        )}${kind.toString()}Input`,
        description: objectMetadata.description,
        fields: this.generateFields(objectMetadata, options),
      }),
    };
  }

  private generateFields(
    objectMetadata: ObjectMetadataInterface,
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLInputFieldConfigMap {
    const fields: GraphQLInputFieldConfigMap = {};

    for (const fieldMetadata of objectMetadata.fields) {
      // Relation field types are generated during extension of object type definition
      if (isRelationFieldMetadataType(fieldMetadata.type)) {
        continue;
      }

      const type = this.orderByTypeFactory.create(fieldMetadata, options, {
        nullable: fieldMetadata.isNullable,
      });

      fields[fieldMetadata.name] = {
        type,
        description: fieldMetadata.description,
        // TODO: Add default value
        defaultValue: undefined,
      };
    }

    return fields;
  }
}
