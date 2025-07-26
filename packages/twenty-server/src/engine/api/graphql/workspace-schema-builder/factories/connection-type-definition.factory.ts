import { Injectable } from '@nestjs/common';

import { GraphQLFieldConfigMap, GraphQLObjectType } from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { AggregationTypeFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/aggregation-type.factory';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

import { ConnectionTypeFactory } from './connection-type.factory';
import {
  ObjectTypeDefinition,
  ObjectTypeDefinitionKind,
} from './object-type-definition.factory';

export enum ConnectionTypeDefinitionKind {
  Edge = 'Edge',
  PageInfo = 'PageInfo',
}

@Injectable()
export class ConnectionTypeDefinitionFactory {
  constructor(
    private readonly connectionTypeFactory: ConnectionTypeFactory,
    private readonly aggregationTypeFactory: AggregationTypeFactory,
  ) {}

  public create(
    objectMetadata: ObjectMetadataEntity,
    options: WorkspaceBuildSchemaOptions,
  ): ObjectTypeDefinition {
    const kind = ObjectTypeDefinitionKind.Connection;

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
  ): GraphQLFieldConfigMap<any, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fields: GraphQLFieldConfigMap<any, any> = {};

    const aggregatedFields = this.aggregationTypeFactory.create(objectMetadata);

    Object.assign(fields, aggregatedFields);

    fields.edges = {
      type: this.connectionTypeFactory.create(
        objectMetadata,
        ConnectionTypeDefinitionKind.Edge,
        options,
        {
          isArray: true,
          arrayDepth: 1,
          nullable: false,
        },
      ),
    };

    fields.pageInfo = {
      type: this.connectionTypeFactory.create(
        objectMetadata,
        ConnectionTypeDefinitionKind.PageInfo,
        options,
        {
          nullable: false,
        },
      ),
    };

    return fields;
  }
}
