import { Injectable } from '@nestjs/common';

import { GraphQLFieldConfigMap, GraphQLObjectType } from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { pascalCase } from 'src/utils/pascal-case';

import {
  ObjectTypeDefinition,
  ObjectTypeDefinitionKind,
} from './object-type-definition.factory';
import { EdgeTypeFactory } from './edge-type.factory';

export enum EdgeTypeDefinitionKind {
  Node = 'Node',
  Cursor = 'Cursor',
}

@Injectable()
export class EdgeTypeDefinitionFactory {
  constructor(private readonly edgeTypeFactory: EdgeTypeFactory) {}

  public create(
    objectMetadata: ObjectMetadataInterface,
    options: WorkspaceBuildSchemaOptions,
  ): ObjectTypeDefinition {
    const kind = ObjectTypeDefinitionKind.Edge;

    return {
      target: objectMetadata.id,
      kind,
      type: new GraphQLObjectType({
        name: `${pascalCase(objectMetadata.nameSingular)}${kind.toString()}`,
        description: objectMetadata.description,
        fields: () => this.generateFields(objectMetadata, options),
      }),
    };
  }

  private generateFields(
    objectMetadata: ObjectMetadataInterface,
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLFieldConfigMap<any, any> {
    const fields: GraphQLFieldConfigMap<any, any> = {};

    fields.node = {
      type: this.edgeTypeFactory.create(
        objectMetadata,
        EdgeTypeDefinitionKind.Node,
        options,
        {
          nullable: false,
        },
      ),
    };

    fields.cursor = {
      type: this.edgeTypeFactory.create(
        objectMetadata,
        EdgeTypeDefinitionKind.Cursor,
        options,
        {
          nullable: false,
        },
      ),
    };

    return fields;
  }
}
