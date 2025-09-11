import { Injectable } from '@nestjs/common';

import { type GraphQLObjectType } from 'graphql';

import { type WorkspaceResolverBuilderQueryMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { GqlObjectTypeName } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-object-type-name.enum';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

import { RootTypeGenerator } from './root-type.factory';

@Injectable()
export class QueryTypeGenerator {
  constructor(private readonly rootTypeGenerator: RootTypeGenerator) {}

  generate(
    objectMetadataCollection: ObjectMetadataEntity[],
    workspaceResolverMethodNames: WorkspaceResolverBuilderQueryMethodNames[],
    options: WorkspaceBuildSchemaOptions,
  ): GraphQLObjectType {
    return this.rootTypeGenerator.generate(
      objectMetadataCollection,
      workspaceResolverMethodNames,
      GqlObjectTypeName.Query,
      options,
    );
  }
}
