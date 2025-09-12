import { Injectable } from '@nestjs/common';

import { type GraphQLObjectType } from 'graphql';

import { type WorkspaceResolverBuilderQueryMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceBuildSchemaOptions } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-build-schema-options.interface';

import { GqlOperation } from 'src/engine/api/graphql/workspace-schema-builder/enums/gql-operation.enum';
import { RootTypeGenerator } from 'src/engine/api/graphql/workspace-schema-builder/gql-type-generators/root-type.generator';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

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
      GqlOperation.Query,
      options,
    );
  }
}
