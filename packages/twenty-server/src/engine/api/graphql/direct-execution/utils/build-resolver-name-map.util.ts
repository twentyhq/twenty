import { workspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/factories/factories';
import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { getResolverName } from 'src/engine/utils/get-resolver-name.util';

export type ResolverNameMapEntry = {
  objectMetadataUniversalIdentifier: string;
  method: WorkspaceResolverBuilderMethodNames;
  operationType: 'query' | 'mutation';
};

export const buildResolverNameMap = (
  objectMetadatas: Pick<
    ObjectMetadataEntity,
    'universalIdentifier' | 'nameSingular' | 'namePlural'
  >[],
): Record<string, ResolverNameMapEntry> => {
  const map: Record<string, ResolverNameMapEntry> = {};

  const allMethods = [
    ...workspaceResolverBuilderMethodNames.queries.map((method) => ({
      method,
      operationType: 'query' as const,
    })),
    ...workspaceResolverBuilderMethodNames.mutations.map((method) => ({
      method,
      operationType: 'mutation' as const,
    })),
  ];

  for (const objectMetadata of objectMetadatas) {
    for (const { method, operationType } of allMethods) {
      const resolverName = getResolverName(objectMetadata, method);

      map[resolverName] = {
        objectMetadataUniversalIdentifier: objectMetadata.universalIdentifier,
        method,
        operationType,
      };
    }
  }

  return map;
};
