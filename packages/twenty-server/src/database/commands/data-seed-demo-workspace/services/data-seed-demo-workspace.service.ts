import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  deleteCoreSchema,
  seedCoreSchema,
} from 'src/database/typeorm-seeds/core/demo';
import { rawDataSource } from 'src/database/typeorm/raw/raw.datasource';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';

@Injectable()
export class DataSeedDemoWorkspaceService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly workspaceManagerService: WorkspaceManagerService,
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly workspaceSchemaCache: CacheStorageService,
  ) {}

  async seedDemo(): Promise<void> {
    try {
      await rawDataSource.initialize();
      const demoWorkspaceIds =
        this.environmentService.get('DEMO_WORKSPACE_IDS');

      if (demoWorkspaceIds.length === 0) {
        throw new Error(
          'Could not get DEMO_WORKSPACE_IDS. Please specify in .env',
        );
      }

      await this.workspaceSchemaCache.flush();

      for (const workspaceId of demoWorkspaceIds) {
        const existingWorkspaces = await this.workspaceRepository.findBy({
          id: workspaceId,
        });

        if (existingWorkspaces.length > 0) {
          await this.workspaceManagerService.delete(workspaceId);
          await deleteCoreSchema(rawDataSource, workspaceId);
        }

        await seedCoreSchema(rawDataSource, workspaceId);
        await this.workspaceManagerService.initDemo(workspaceId);
      }
    } catch (error) {
      console.error(error);

      return;
    }
  }
}
