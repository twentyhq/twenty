import { type WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { type Resolver } from './workspace-resolvers-builder.interface';

export interface WorkspaceResolverBuilderFactoryInterface {
  create(context: WorkspaceSchemaBuilderContext): Resolver;
}
