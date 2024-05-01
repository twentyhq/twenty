import { Module } from '@nestjs/common';

import { ExtensionResolverServices } from 'src/engine/api/graphql/workspace-schema-extension/resolvers';
import { EXTENSION_SERVICES } from 'src/engine/api/graphql/workspace-schema-extension/types/extension-service';
import { WorkspaceSchemaExtensionFactory } from 'src/engine/api/graphql/workspace-schema-extension/workspace-schema-extension.factory';

@Module({
  providers: [
    WorkspaceSchemaExtensionFactory,
    // Provide all resolver services at once
    ...ExtensionResolverServices,
    // Assemble all resolver services within single provider
    {
      provide: EXTENSION_SERVICES,
      useFactory: (...services) => services,
      inject: ExtensionResolverServices,
    },
  ],
  exports: [WorkspaceSchemaExtensionFactory],
})
export class WorkspaceSchemaExtensionModule {}
