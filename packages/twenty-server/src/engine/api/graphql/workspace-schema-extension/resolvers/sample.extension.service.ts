import { Injectable } from '@nestjs/common';

import { ExtensionResolverService } from 'src/engine/api/graphql/workspace-schema-extension/interfaces/extension-service.interface';

import { ExtensionResolver } from 'src/engine/api/graphql/workspace-schema-extension/decorators/extension-resolver.decorator';
import {
  ExtensionResolverType,
  ExtensionServiceResolverOptionsArg,
} from 'src/engine/api/graphql/workspace-schema-extension/types/extension-resolver';

@Injectable()
export class SampleExtensionService implements ExtensionResolverService {
  // Dependecies can be injected here
  //   constructor() {}

  // Use this Decorator to mark GraphQL Root type for this resolver
  // Resolver function name must be same as GraphQL Query, Mutation or Object name
  // Arguments in this Resolver function
  // args - args object passed to Query, Mutation or GraphQL object
  // options - this will contain useful information
  @ExtensionResolver(ExtensionResolverType.QUERY)
  bonjour(args: any, options: ExtensionServiceResolverOptionsArg) {
    return `Hello World - WorkspaceId - ${options.workspaceId}`;
  }
}
