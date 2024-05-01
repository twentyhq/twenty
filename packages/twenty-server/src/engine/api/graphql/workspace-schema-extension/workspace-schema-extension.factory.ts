import { Inject, Injectable } from '@nestjs/common';

import { loadFiles } from '@graphql-tools/load-files';
import { print } from 'graphql';

import { ExtensionResolverService } from 'src/engine/api/graphql/workspace-schema-extension/interfaces/extension-service.interface';
import { Resolver } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { EXTENSION_SERVICES } from 'src/engine/api/graphql/workspace-schema-extension/types/extension-service';
import { TypedReflect } from 'src/utils/typed-reflect';
import { ExtensionResolverTypeKeyMap } from 'src/engine/api/graphql/workspace-schema-extension/types/extension-resolver';

@Injectable()
export class WorkspaceSchemaExtensionFactory {
  constructor(
    @Inject(EXTENSION_SERVICES)
    private readonly extensionResolverServices: ExtensionResolverService[],
  ) {}

  private async getTypeDefs() {
    const typeDefs = await loadFiles(
      'src/engine/api/graphql/workspace-schema-extension/typedefs/*.graphql',
    );

    return typeDefs.map((doc) => print(doc)).join('\n');
  }

  private transformSchemaExtensionResolverToGraphQLResolver(
    workspaceId: string,
    serviceIndex: number,
    methodName: string,
  ): Resolver {
    return (_source, args, context, info) => {
      return this.extensionResolverServices[serviceIndex][methodName](args, {
        workspaceId,
        info,
      });
    };
  }

  private getResolvers(workspaceId: string) {
    const resolvers = {
      Query: {},
      Mutation: {},
    };

    this.extensionResolverServices.forEach((service, index) => {
      const servicePrototype = Object.getPrototypeOf(service);

      Object.getOwnPropertyNames(servicePrototype).forEach((methodName) => {
        const resolverType = TypedReflect.getMetadata(
          'extensionResolverType',
          service,
          methodName,
        );

        if (resolverType) {
          const resolverKey = ExtensionResolverTypeKeyMap[resolverType];
          const resolverObject = resolverKey
            ? resolvers[resolverKey]
            : resolvers;

          resolverObject[methodName] =
            this.transformSchemaExtensionResolverToGraphQLResolver(
              workspaceId,
              index,
              methodName,
            );
        }
      });
    });

    return resolvers;
  }

  async generateSchema(workspaceId: string) {
    return {
      typeDefs: await this.getTypeDefs(),
      resolvers: this.getResolvers(workspaceId),
    };
  }
}
