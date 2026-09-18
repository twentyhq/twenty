import { ConflictException, Inject, Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { UPDATE_RECORD_EXPORT_LEASE_SCRIPT } from 'src/engine/core-modules/record-export/constants/update-record-export-lease-script.constant';
import { CREATE_RECORD_EXPORT_DOWNLOAD_SCRIPT } from 'src/engine/core-modules/record-export/constants/create-record-export-download-script.constant';
import {
  RECORD_EXPORT_DOWNLOAD_TTL_MS,
  RECORD_EXPORT_CONNECTION_TTL_MS,
} from 'src/engine/core-modules/record-export/constants/record-export.constants';
import {
  type RecordExport,
  type RecordExportDownload,
} from 'src/engine/core-modules/record-export/types/record-export.type';

type ExportIdentity = Pick<RecordExport, 'workspaceId' | 'id'>;

@Injectable()
export class RecordExportCacheService {
  constructor(
    @Inject(CacheStorageNamespace.EngineRecordExport)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async acquireLease(recordExport: ExportIdentity): Promise<void> {
    const created = await this.cacheStorageService.setIfAbsent(
      this.getActiveKey(recordExport.workspaceId),
      recordExport.id,
      RECORD_EXPORT_CONNECTION_TTL_MS,
    );
    if (!created) {
      throw new ConflictException(
        t`An export is already running in this workspace. Please wait for it to finish.`,
      );
    }
  }

  async isConnected({ workspaceId, id }: ExportIdentity): Promise<boolean> {
    return (
      (await this.cacheStorageService.get<string>(
        this.getActiveKey(workspaceId),
      )) === id
    );
  }

  renewLease(recordExport: ExportIdentity): Promise<boolean> {
    return this.updateLease(recordExport, RECORD_EXPORT_CONNECTION_TTL_MS);
  }

  releaseLease(recordExport: ExportIdentity): Promise<boolean> {
    return this.updateLease(recordExport, 0);
  }

  async createDownload(recordExport: RecordExportDownload): Promise<boolean> {
    return (
      (await this.cacheStorageService.runScript<number>({
        script: CREATE_RECORD_EXPORT_DOWNLOAD_SCRIPT,
        keys: [
          this.getActiveKey(recordExport.workspaceId),
          this.getDownloadKey(recordExport),
        ],
        args: [
          JSON.stringify(recordExport.id),
          JSON.stringify(recordExport),
          String(RECORD_EXPORT_DOWNLOAD_TTL_MS),
        ],
      })) === 1
    );
  }

  findDownload(
    recordExport: ExportIdentity,
  ): Promise<RecordExportDownload | undefined> {
    return this.cacheStorageService.get<RecordExportDownload>(
      this.getDownloadKey(recordExport),
    );
  }

  async claimDownload(recordExport: ExportIdentity): Promise<boolean> {
    const claimed = await this.cacheStorageService.setIfAbsent(
      `${this.getDownloadKey(recordExport)}:claimed`,
      true,
      RECORD_EXPORT_DOWNLOAD_TTL_MS,
    );
    return claimed && isDefined(await this.findDownload(recordExport));
  }

  async delete(recordExport: ExportIdentity): Promise<void> {
    await this.releaseLease(recordExport);
    await this.cacheStorageService.del(this.getDownloadKey(recordExport));
  }

  private async updateLease(
    { workspaceId, id }: ExportIdentity,
    ttl: number,
  ): Promise<boolean> {
    return (
      (await this.cacheStorageService.runScript<number>({
        script: UPDATE_RECORD_EXPORT_LEASE_SCRIPT,
        keys: [this.getActiveKey(workspaceId)],
        args: [JSON.stringify(id), String(ttl)],
      })) === 1
    );
  }

  private getDownloadKey({ workspaceId, id }: ExportIdentity): string {
    return `{${workspaceId}}:download:${id}`;
  }

  private getActiveKey(workspaceId: string): string {
    return `{${workspaceId}}:active`;
  }
}
