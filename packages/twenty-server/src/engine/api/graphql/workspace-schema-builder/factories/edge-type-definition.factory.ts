import { Injectable } from '@nestjs/common';

import { GraphQLFieldConfigMap, GraphQLObjectType } from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

import { EdgeTypeFactory } from './edge-type.factory';
import {
  ObjectTypeDefinition,
  ObjectTypeDefinitionKind,
} from './object-type-definition.factory';

export enum EdgeTypeDefinitionKind {
  Node = 'Node',
  Cursor = 'Cursor',
}

@Injectable()
export class EdgeTypeDefinitionFactory {
  constructor(private readonly edgeTypeFactory: EdgeTypeFactory) {}

  public create(
    objectMetadata: ObjectMetadataEntity,
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
    objectMetadata: ObjectMetadataEntity,
    options: WorkspaceBuildSchemaOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): GraphQLFieldConfigMap<any, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
