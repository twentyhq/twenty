import { Injectable } from '@nestjs/common';

import { GraphQLObjectType } from 'graphql';

import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { FieldFactory } from 'src/engine/api/graphql/workspace-schema-builder/factories/field.factory';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

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
  constructor(private readonly fieldFactory: FieldFactory) {}

  public create(
    objectMetadata: ObjectMetadataEntity,
    kind: ObjectTypeDefinitionKind,
    options: WorkspaceBuildSchemaOptions,
  ): ObjectTypeDefinition {
    return {
      target: objectMetadata.id,
      kind,
      type: new GraphQLObjectType({
        name: `${pascalCase(objectMetadata.nameSingular)}${kind.toString()}`,
        description: objectMetadata.description,
        fields: this.fieldFactory.create({
          objectMetadata,
          kind,
          options,
        }),
      }),
    };
  }
}
