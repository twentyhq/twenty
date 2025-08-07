import { Injectable } from '@nestjs/common';

import { GraphQLObjectType } from 'graphql';

import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { generateFields } from 'src/engine/api/graphql/workspace-schema-builder/utils/generate-fields.util';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { pascalCase } from 'src/utils/pascal-case';

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
        fields: generateFields({
          objectMetadata,
          kind,
          options,
          typeFactory: this.outputTypeFactory,
        }),
      }),
    };
  }
}
