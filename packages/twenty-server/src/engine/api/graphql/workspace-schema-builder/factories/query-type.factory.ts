import { Injectable } from '@nestjs/common';

import { type GraphQLObjectType } from 'graphql';

import { type WorkspaceResolverBuilderQueryMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

import { ObjectTypeName, RootTypeFactory } from './root-type.factory';

@Injectable()
export class QueryTypeFactory {
  constructor(private readonly rootTypeFactory: RootTypeFactory) {}

  create(
    objectMetadataCollection: ObjectMetadataEntity[],
    workspaceResolverMethodNames: WorkspaceResolverBuilderQueryMethodNames[],
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLObjectType {
    return this.rootTypeFactory.create(
      objectMetadataCollection,
      workspaceResolverMethodNames,
      ObjectTypeName.Query,
      options,
    );
  }
}
