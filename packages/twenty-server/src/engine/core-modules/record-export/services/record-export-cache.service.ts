import { ConflictException, Inject, Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { UPDATE_RECORD_EXPORT_LEASE_SCRIPT } from 'src/engine/core-modules/record-export/constants/update-record-export-lease-script.constant';
import {
  RECORD_EXPORT_MAX_DURATION_MS,
  RECORD_EXPORT_DOWNLOAD_TTL_MS,
  RECORD_EXPORT_CONNECTION_TTL_MS,
} from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { UPDATE_RECORD_EXPORT_SCRIPT } from 'src/engine/core-modules/record-export/constants/update-record-export-script.constant';
import { RecordExportStatus } from 'src/engine/core-modules/record-export/enums/record-export-status.enum';
import { type RecordExport } from 'src/engine/core-modules/record-export/types/record-export.type';

type RecordExportChanges = Partial<
  Pick<
    RecordExport,
    | 'status'
    | 'processedRecordCount'
    | 'jobId'
    | 'attemptId'
    | 'filePath'
    | 'errorMessage'
    | 'totalRecordCount'
  >
>;
type RecordExportCondition = {
  statuses?: RecordExportStatus[];
  attemptId?: string | null;
};

@Injectable()
export class RecordExportCacheService {
  constructor(
    @Inject(CacheStorageNamespace.EngineRecordExport)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async create(
    input: Pick<
      RecordExport,
      | 'workspaceId'
      | 'userWorkspaceId'
      | 'workspaceMemberId'
      | 'parameters'
      | 'filename'
    >,
  ): Promise<RecordExport> {
    const now = new Date();
    const state = {
      status: RecordExportStatus.QUEUED,
      processedRecordCount: 0,
      totalRecordCount: null,
      jobId: null,
      attemptId: null,
      filePath: null,
      errorMessage: null,
      updatedAt: now,
    };
    const recordExport: RecordExport = {
      ...input,
      ...state,
      id: v4(),
      createdAt: now,
      expiresAt: new Date(now.getTime() + RECORD_EXPORT_MAX_DURATION_MS),
    };
    const created = await this.cacheStorageService.setIfAbsent(
      this.getActiveKey(input.workspaceId),
      recordExport.id,
      RECORD_EXPORT_CONNECTION_TTL_MS,
    );
    if (!created)
      throw new ConflictException(
        t`An export is already running in this workspace. Please wait for it to finish.`,
      );
    try {
      await this.cacheStorageService.set(
        this.getRecordKey(recordExport),
        recordExport,
        RECORD_EXPORT_MAX_DURATION_MS,
      );
    } catch (error) {
      await this.delete(recordExport);
      throw error;
    }
    return recordExport;
  }

  async findOne({
    workspaceId,
    id,
    keepAlive = false,
  }: {
    workspaceId: string;
    id: string;
    keepAlive?: boolean;
  }): Promise<RecordExport | undefined> {
    const connected = keepAlive
      ? await this.updateLease({
          workspaceId,
          id,
          ttl: RECORD_EXPORT_CONNECTION_TTL_MS,
        })
      : (await this.cacheStorageService.get<string>(
          this.getActiveKey(workspaceId),
        )) === id;
    const recordExport = await this.cacheStorageService.get<RecordExport>(
      this.getRecordKey({ workspaceId, id }),
    );
    if (!isDefined(recordExport)) return undefined;
    if (!connected && this.isRunning(recordExport)) return undefined;
    return {
      ...recordExport,
      createdAt: new Date(recordExport.createdAt),
      updatedAt: new Date(recordExport.updatedAt),
      expiresAt: new Date(recordExport.expiresAt),
    };
  }

  async update({
    workspaceId,
    id,
    condition,
    changes,
  }: {
    workspaceId: string;
    id: string;
    condition: RecordExportCondition;
    changes: RecordExportChanges;
  }): Promise<boolean> {
    while (true) {
      const recordExport = await this.findOne({ workspaceId, id });
      if (
        !isDefined(recordExport) ||
        (isDefined(condition.statuses) &&
          !condition.statuses.includes(recordExport.status)) ||
        (condition.attemptId !== undefined &&
          condition.attemptId !== recordExport.attemptId)
      ) {
        return false;
      }
      let expiresAt = recordExport.expiresAt;
      if (changes.status === RecordExportStatus.COMPLETED) {
        expiresAt = new Date(Date.now() + RECORD_EXPORT_DOWNLOAD_TTL_MS);
      }
      if (changes.status === RecordExportStatus.FAILED) {
        expiresAt = new Date(Date.now() + RECORD_EXPORT_CONNECTION_TTL_MS);
      }
      const updated = {
        ...recordExport,
        ...changes,
        updatedAt: new Date(),
        expiresAt,
      };
      const ttl = updated.expiresAt.getTime() - Date.now();
      if (ttl <= 0) return false;
      const updatedRecord = await this.cacheStorageService.runScript<number>({
        script: UPDATE_RECORD_EXPORT_SCRIPT,
        keys: [
          this.getRecordKey({ workspaceId, id }),
          this.getActiveKey(workspaceId),
        ],
        args: [
          JSON.stringify(recordExport),
          JSON.stringify(updated),
          String(ttl),
          this.isRunning(recordExport) ? JSON.stringify(id) : '',
          this.isRunning(updated) ? '0' : '1',
        ],
      });
      if (updatedRecord === 0) return false;
      if (updatedRecord === -1) continue;
      return true;
    }
  }

  private isRunning(recordExport: RecordExport): boolean {
    return [RecordExportStatus.QUEUED, RecordExportStatus.PROCESSING].includes(
      recordExport.status,
    );
  }

  private async updateLease({
    workspaceId,
    id,
    ttl,
  }: {
    workspaceId: string;
    id: string;
    ttl: number;
  }): Promise<boolean> {
    return (
      (await this.cacheStorageService.runScript<number>({
        script: UPDATE_RECORD_EXPORT_LEASE_SCRIPT,
        keys: [this.getActiveKey(workspaceId)],
        args: [JSON.stringify(id), String(ttl)],
      })) === 1
    );
  }

  private getRecordKey({
    workspaceId,
    id,
  }: {
    workspaceId: string;
    id: string;
  }): string {
    return `{${workspaceId}}:export:${id}`;
  }

  private getActiveKey(workspaceId: string): string {
    return `{${workspaceId}}:active`;
  }

  async delete({
    workspaceId,
    id,
  }: {
    workspaceId: string;
    id: string;
  }): Promise<void> {
    await this.cacheStorageService.del(this.getRecordKey({ workspaceId, id }));
    await this.updateLease({ workspaceId, id, ttl: 0 });
  }
}
