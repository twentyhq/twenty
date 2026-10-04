import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';

import {
  type ResolverNameMapEntry,
  buildResolverNameMap,
} from 'src/engine/api/graphql/direct-execution/utils/build-resolver-name-map.util';
import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Injectable()
@WorkspaceDerivedCache('graphQLResolverNameMap', { maxMemoizedWorkspaces: 256 })
export class WorkspaceResolverNameMapCacheService extends WorkspaceDerivedCacheProvider<
  'graphQLResolverNameMap',
  'flatObjectMetadataMaps'
> {
  readonly sourceKeyNames = ['flatObjectMetadataMaps'] as const;

  computeFromSources({
    flatObjectMetadataMaps,
  }: Pick<WorkspaceCacheDataMap, 'flatObjectMetadataMaps'>): Record<
    string,
    ResolverNameMapEntry
  > {
    return buildResolverNameMap(
      Object.values(flatObjectMetadataMaps.byUniversalIdentifier).filter(
        isDefined,
      ),
    );
  }
}
