import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { seedCoreSchema } from 'src/database/typeorm-seeds/core';
import { deleteCoreSchema } from 'src/database/typeorm-seeds/core/demo';
import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';

@Injectable()
export class DataSeedDemoWorkspaceService {
  constructor(
    private readonly workspaceManagerService: WorkspaceManagerService,
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly workspaceSchemaCache: CacheStorageService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async seedDemo(): Promise<void> {
    try {
      await rawDataSource.initialize();

      // TODO: migrate demo seeds to dev seeds
      const demoWorkspaceIds = ['', ''];

      await this.workspaceSchemaCache.flush();

      for (const workspaceId of demoWorkspaceIds) {
        const existingWorkspaces = await this.workspaceRepository.findBy({
          id: workspaceId,
        });

        if (existingWorkspaces.length > 0) {
          await this.workspaceManagerService.delete(workspaceId);
          await deleteCoreSchema(rawDataSource, workspaceId);
        }

        const appVersion = this.twentyConfigService.get('APP_VERSION');

        await seedCoreSchema({
          dataSource: rawDataSource,
          workspaceId,
          appVersion,
          seedBilling: false,
          seedFeatureFlags: false,
        });
        await this.workspaceManagerService.initDemo(workspaceId);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);

      return;
    }
  }
}
