import { isDefined } from 'twenty-shared/utils';

import { workspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/factories/factories';
import { type WorkspaceResolverBuilderMethodNames } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getResolverName } from 'src/engine/utils/get-resolver-name.util';

export type ResolverNameMapEntry = {
  objectMetadataUniversalIdentifier: string;
  method: WorkspaceResolverBuilderMethodNames;
  operationType: 'query' | 'mutation';
};

export const buildResolverNameMap = (
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
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

  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    for (const { method, operationType } of allMethods) {
      const resolverName = getResolverName(flatObjectMetadata, method);

      map[resolverName] = {
        objectMetadataUniversalIdentifier:
          flatObjectMetadata.universalIdentifier,
        method,
        operationType,
      };
    }
  }

  return map;
};
