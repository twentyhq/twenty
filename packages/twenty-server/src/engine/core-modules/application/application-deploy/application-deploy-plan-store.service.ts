import { Injectable } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { type Manifest } from 'twenty-shared/application';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

const STORED_PLAN_TTL_MS = 30 * 60 * 1000;

export type StoredDeployPlan = {
  applicationUniversalIdentifier: string;
  manifest: Manifest;
  planDigest: string;
};

@Injectable()
export class ApplicationDeployPlanStoreService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineApplicationDeployPlan)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async store({
    workspaceId,
    plan,
  }: {
    workspaceId: string;
    plan: StoredDeployPlan;
  }): Promise<string> {
    const planId = randomUUID();

    await this.cacheStorage.set(
      this.getKey(workspaceId, planId),
      plan,
      STORED_PLAN_TTL_MS,
    );

    return planId;
  }

  async get({
    workspaceId,
    planId,
  }: {
    workspaceId: string;
    planId: string;
  }): Promise<StoredDeployPlan | undefined> {
    return this.cacheStorage.get<StoredDeployPlan>(
      this.getKey(workspaceId, planId),
    );
  }

  async consume({
    workspaceId,
    planId,
  }: {
    workspaceId: string;
    planId: string;
  }): Promise<void> {
    await this.cacheStorage.del(this.getKey(workspaceId, planId));
  }

  private getKey(workspaceId: string, planId: string): string {
    return `deploy-plan:${workspaceId}:${planId}`;
  }
}
