import { Injectable } from '@nestjs/common';

import { GraphQLFieldConfigMap, GraphQLInt, GraphQLObjectType } from 'graphql';

import { WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-optionts.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { getAvailableAggregationsFromObjectFields } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
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
  constructor(private readonly connectionTypeFactory: ConnectionTypeFactory) {}

  public create(
    objectMetadata: ObjectMetadataInterface,
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
    objectMetadata: ObjectMetadataInterface,
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLFieldConfigMap<any, any> {
    const fields: GraphQLFieldConfigMap<any, any> = Object.assign(
      {},
      ...getAvailableAggregationsFromObjectFields(objectMetadata.fields).map(
        (agg) => {
          const [
            [
              key,
              {
                aggregationType: _aggregationType,
                fromField: _fromField,
                ...rest
              },
            ],
          ] = Object.entries(agg);

          return { [key]: rest };
        },
      ),
    );

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

    fields.totalCount = {
      type: GraphQLInt,
      description: 'Total number of records in the connection',
    };

    return fields;
  }
}
