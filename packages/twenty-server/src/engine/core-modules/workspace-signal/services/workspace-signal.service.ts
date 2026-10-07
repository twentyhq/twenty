import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { type WorkspaceSignalName } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { WORKSPACE_SIGNAL_CHANGED_EVENT } from 'src/engine/core-modules/workspace-signal/constants/workspace-signal-changed-event.constant';
import { WORKSPACE_SIGNAL_DEFAULT_TTL_MS } from 'src/engine/core-modules/workspace-signal/constants/workspace-signal-default-ttl-ms.constant';
import { type WorkspaceSignalChangedEvent } from 'src/engine/core-modules/workspace-signal/types/workspace-signal-changed-event.type';
import { type WorkspaceSignalState } from 'src/engine/core-modules/workspace-signal/types/workspace-signal-state.type';

export type WorkspaceSignalStates = Partial<
  Record<WorkspaceSignalName, WorkspaceSignalState>
>;

@Injectable()
export class WorkspaceSignalService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspaceSignal)
    private readonly cacheStorage: CacheStorageService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async set({
    workspaceId,
    name,
    ttlMs = WORKSPACE_SIGNAL_DEFAULT_TTL_MS,
  }: {
    workspaceId: string;
    name: WorkspaceSignalName;
    ttlMs?: number;
  }): Promise<void> {
    const key = this.buildKey({ workspaceId, name });
    const state: WorkspaceSignalState = { since: new Date().toISOString() };

    const wasAbsent = await this.cacheStorage.setIfAbsent(key, state, ttlMs);

    if (!wasAbsent) {
      await this.cacheStorage.expire(key, ttlMs);

      return;
    }

    this.emitChanged({ workspaceId, name, isSet: true });
  }

  async clear({
    workspaceId,
    name,
  }: {
    workspaceId: string;
    name: WorkspaceSignalName;
  }): Promise<void> {
    await this.cacheStorage.del(this.buildKey({ workspaceId, name }));

    this.emitChanged({ workspaceId, name, isSet: false });
  }

  async read({
    workspaceId,
    names,
  }: {
    workspaceId: string;
    names: WorkspaceSignalName[];
  }): Promise<WorkspaceSignalStates> {
    const states = await Promise.all(
      names.map((name) =>
        this.cacheStorage.get<WorkspaceSignalState>(
          this.buildKey({ workspaceId, name }),
        ),
      ),
    );

    return Object.fromEntries(
      names.flatMap((name, index) => {
        const state = states[index];

        return isDefined(state) ? [[name, state]] : [];
      }),
    );
  }

  private emitChanged(changedEvent: WorkspaceSignalChangedEvent): void {
    this.eventEmitter.emit(WORKSPACE_SIGNAL_CHANGED_EVENT, changedEvent);
  }

  private buildKey({
    workspaceId,
    name,
  }: {
    workspaceId: string;
    name: WorkspaceSignalName;
  }): string {
    return `${workspaceId}:${name}`;
  }
}
