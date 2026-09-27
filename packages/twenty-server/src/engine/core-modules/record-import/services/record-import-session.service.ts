import { Inject, Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { RECORD_IMPORT_SESSION_TTL_MS } from 'src/engine/core-modules/record-import/constants/record-import.constants';
import { SAVE_RECORD_IMPORT_SESSION_SCRIPT } from 'src/engine/core-modules/record-import/constants/save-record-import-session-script.constant';
import { TOUCH_RECORD_IMPORT_SESSION_SCRIPT } from 'src/engine/core-modules/record-import/constants/touch-record-import-session-script.constant';
import { UPDATE_RECORD_IMPORT_LEASE_SCRIPT } from 'src/engine/core-modules/record-import/constants/update-record-import-lease-script.constant';
import { type RecordImportSession } from 'src/engine/core-modules/record-import/types/record-import-session.type';
import { getRecordImportSessionCacheKey } from 'src/engine/core-modules/record-import/utils/get-record-import-session-cache-key.util';

const MAX_UPDATE_ATTEMPTS = 5;

@Injectable()
export class RecordImportSessionService {
  constructor(
    @Inject(CacheStorageNamespace.EngineRecordImport)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async find({
    workspaceId,
    id,
  }: Pick<RecordImportSession, 'workspaceId' | 'id'>): Promise<
    RecordImportSession | undefined
  > {
    return this.cacheStorageService.get<RecordImportSession>(
      getRecordImportSessionCacheKey({ workspaceId, id }),
    );
  }

  async existingIds({
    workspaceId,
    ids,
  }: {
    workspaceId: string;
    ids: string[];
  }): Promise<Set<string>> {
    const sessions = await this.cacheStorageService.mget<RecordImportSession>(
      ids.map((id) => getRecordImportSessionCacheKey({ workspaceId, id })),
    );

    return new Set(sessions.filter(isDefined).map((session) => session.id));
  }

  async create(session: RecordImportSession): Promise<boolean> {
    return this.save(session, undefined);
  }

  // Returns the saved session, or undefined when another writer won the race
  // or the session changed status in a way the update does not accept.
  async compareAndUpdate(
    session: RecordImportSession,
    update: (current: RecordImportSession) => RecordImportSession | undefined,
  ): Promise<RecordImportSession | undefined> {
    const next = update(session);

    if (!isDefined(next)) {
      return undefined;
    }

    const saved = {
      ...next,
      version: session.version + 1,
      updatedAt: Date.now(),
    };

    return (await this.save(saved, session.version)) ? saved : undefined;
  }

  // Re-reads and retries on conflicts, for writers such as the job that do
  // not act on a version the user saw.
  async update(
    key: Pick<RecordImportSession, 'workspaceId' | 'id'>,
    update: (current: RecordImportSession) => RecordImportSession | undefined,
  ): Promise<RecordImportSession | undefined> {
    for (let attempt = 0; attempt < MAX_UPDATE_ATTEMPTS; attempt++) {
      const current = await this.find(key);

      if (!isDefined(current)) {
        return undefined;
      }

      const next = update(current);

      if (!isDefined(next)) {
        return current;
      }

      const saved = await this.compareAndUpdate(current, () => next);

      if (isDefined(saved)) {
        return saved;
      }
    }

    return undefined;
  }

  async touch(key: Pick<RecordImportSession, 'workspaceId' | 'id'>) {
    await this.cacheStorageService.runScript<number>({
      script: TOUCH_RECORD_IMPORT_SESSION_SCRIPT,
      keys: [getRecordImportSessionCacheKey(key)],
      args: [String(RECORD_IMPORT_SESSION_TTL_MS)],
    });
  }

  async delete(
    key: Pick<RecordImportSession, 'workspaceId' | 'id'>,
  ): Promise<void> {
    await this.cacheStorageService.del(getRecordImportSessionCacheKey(key));
  }

  async acquireWorkspaceLease({
    workspaceId,
    id,
    ttlMs,
  }: Pick<RecordImportSession, 'workspaceId' | 'id'> & {
    ttlMs: number;
  }): Promise<boolean> {
    return this.cacheStorageService.setIfAbsent(
      this.getWorkspaceLeaseKey(workspaceId),
      id,
      ttlMs,
    );
  }

  async updateWorkspaceLease({
    workspaceId,
    id,
    ttlMs,
  }: Pick<RecordImportSession, 'workspaceId' | 'id'> & {
    ttlMs: number;
  }): Promise<boolean> {
    return (
      (await this.cacheStorageService.runScript<number>({
        script: UPDATE_RECORD_IMPORT_LEASE_SCRIPT,
        keys: [this.getWorkspaceLeaseKey(workspaceId)],
        args: [JSON.stringify(id), String(ttlMs)],
      })) === 1
    );
  }

  private async save(
    session: RecordImportSession,
    expectedVersion: number | undefined,
  ): Promise<boolean> {
    return (
      (await this.cacheStorageService.runScript<number>({
        script: SAVE_RECORD_IMPORT_SESSION_SCRIPT,
        keys: [getRecordImportSessionCacheKey(session)],
        args: [
          isDefined(expectedVersion) ? String(expectedVersion) : '',
          JSON.stringify(session),
          String(RECORD_IMPORT_SESSION_TTL_MS),
        ],
      })) === 1
    );
  }

  private getWorkspaceLeaseKey(workspaceId: string) {
    return `{${workspaceId}}:active-import`;
  }
}
