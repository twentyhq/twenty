import { Inject, Injectable } from '@nestjs/common';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { WORKSPACE_DATA_EXPORT_STATE_TTL_MS } from 'src/engine/core-modules/workspace-data-export/constants/workspace-data-export.constant';
import { type WorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-state.type';

type StateKey = { workspaceId: string; exportId: string };

@Injectable()
export class WorkspaceDataExportStateService {
  constructor(
    @Inject(CacheStorageNamespace.EngineWorkspaceDataExport)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  get(key: StateKey): Promise<WorkspaceDataExportState | undefined> {
    return this.cacheStorageService.get<WorkspaceDataExportState>(
      this.buildKey(key),
    );
  }

  async set(key: StateKey, state: WorkspaceDataExportState): Promise<void> {
    await this.cacheStorageService.set(
      this.buildKey(key),
      state,
      WORKSPACE_DATA_EXPORT_STATE_TTL_MS,
    );
  }

  async delete(key: StateKey): Promise<void> {
    await this.cacheStorageService.del(this.buildKey(key));
  }

  private buildKey({ workspaceId, exportId }: StateKey): string {
    return `{${workspaceId}}:${exportId}`;
  }
}
