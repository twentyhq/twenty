import { Inject, Injectable } from '@nestjs/common';

import { CacheStorageService } from 'src/integrations/cache-storage/cache-storage.service';
import { CacheStorageNamespace } from 'src/integrations/cache-storage/types/cache-storage-namespace.enum';
import { ObjectMetadataEntity } from 'src/engine-metadata/object-metadata/object-metadata.entity';
import { WorkspaceCacheVersionService } from 'src/engine-metadata/workspace-cache-version/workspace-cache-version.service';

@Injectable()
export class WorkspaceSchemaStorageService {
  constructor(
    @Inject(CacheStorageNamespace.WorkspaceSchema)
    private readonly workspaceSchemaCache: CacheStorageService,

    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
  ) {}

  async validateCacheVersion(workspaceId: string): Promise<void> {
    const currentVersion =
      (await this.workspaceSchemaCache.get<string>(
        `cacheVersion:${workspaceId}`,
      )) ?? '0';

    let latestVersion =
      await this.workspaceCacheVersionService.getVersion(workspaceId);

    if (!latestVersion || currentVersion !== latestVersion) {
      // Invalidate cache if version mismatch is detected
      await this.invalidateCache(workspaceId);

      // If the latest version is not found, increment the version
      latestVersion ??=
        await this.workspaceCacheVersionService.incrementVersion(workspaceId);

      // Update the cache version after invalidation
      await this.workspaceSchemaCache.set<string>(
        `cacheVersion:${workspaceId}`,
        latestVersion,
      );
    }
  }

  setObjectMetadataCollection(
    workspaceId: string,
    objectMetadataCollection: ObjectMetadataEntity[],
  ) {
    return this.workspaceSchemaCache.set<ObjectMetadataEntity[]>(
      `objectMetadataCollection:${workspaceId}`,
      objectMetadataCollection,
    );
  }

  getObjectMetadataCollection(
    workspaceId: string,
  ): Promise<ObjectMetadataEntity[] | undefined> {
    return this.workspaceSchemaCache.get<ObjectMetadataEntity[]>(
      `objectMetadataCollection:${workspaceId}`,
    );
  }

  setTypeDefs(workspaceId: string, typeDefs: string): Promise<void> {
    return this.workspaceSchemaCache.set<string>(
      `typeDefs:${workspaceId}`,
      typeDefs,
    );
  }

  getTypeDefs(workspaceId: string): Promise<string | undefined> {
    return this.workspaceSchemaCache.get<string>(`typeDefs:${workspaceId}`);
  }

  setUsedScalarNames(
    workspaceId: string,
    scalarsUsed: string[],
  ): Promise<void> {
    return this.workspaceSchemaCache.set<string[]>(
      `usedScalarNames:${workspaceId}`,
      scalarsUsed,
    );
  }

  getUsedScalarNames(workspaceId: string): Promise<string[] | undefined> {
    return this.workspaceSchemaCache.get<string[]>(
      `usedScalarNames:${workspaceId}`,
    );
  }

  async invalidateCache(workspaceId: string): Promise<void> {
    await this.workspaceSchemaCache.del(
      `objectMetadataCollection:${workspaceId}`,
    );
    await this.workspaceSchemaCache.del(`typeDefs:${workspaceId}`);
    await this.workspaceSchemaCache.del(`usedScalarNames:${workspaceId}`);
  }
}
