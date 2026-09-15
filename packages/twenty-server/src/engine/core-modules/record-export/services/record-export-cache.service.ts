import { ConflictException, Inject, Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { CREATE_RECORD_EXPORT_SCRIPT } from 'src/engine/core-modules/record-export/constants/create-record-export-script.constant';
import { DELETE_RECORD_EXPORT_SCRIPT } from 'src/engine/core-modules/record-export/constants/delete-record-export-script.constant';
import { READ_RECORD_EXPORT_SCRIPT } from 'src/engine/core-modules/record-export/constants/read-record-export-script.constant';
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
    | 'expiresAt'
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
    const created = await this.cacheStorageService.runScript<number>({
      script: CREATE_RECORD_EXPORT_SCRIPT,
      keys: [
        this.getRecordKey(input.workspaceId, recordExport.id),
        this.getActiveKey(input.workspaceId),
      ],
      args: [
        recordExport.id,
        JSON.stringify(recordExport),
        JSON.stringify(state),
        String(RECORD_EXPORT_CONNECTION_TTL_MS),
      ],
    });
    if (!created)
      throw new ConflictException(
        t`An export is already running in this workspace. Please wait for it to finish.`,
      );
    return recordExport;
  }

  async findOne(
    workspaceId: string,
    id: string,
    keepAlive = false,
  ): Promise<RecordExport | undefined> {
    const [data, state] = await this.cacheStorageService.runScript<
      (string | null)[]
    >({
      script: READ_RECORD_EXPORT_SCRIPT,
      keys: [
        this.getRecordKey(workspaceId, id),
        this.getActiveKey(workspaceId),
      ],
      args: [id, String(keepAlive ? RECORD_EXPORT_CONNECTION_TTL_MS : 0)],
    });
    if (!isDefined(data) || !isDefined(state)) return undefined;
    const recordExport = {
      ...JSON.parse(data),
      ...JSON.parse(state),
    } as RecordExport;
    return {
      ...recordExport,
      createdAt: new Date(recordExport.createdAt),
      updatedAt: new Date(recordExport.updatedAt),
      expiresAt: new Date(recordExport.expiresAt),
    };
  }

  async update(
    workspaceId: string,
    id: string,
    condition: RecordExportCondition,
    changes: RecordExportChanges,
  ): Promise<boolean> {
    return (
      (await this.cacheStorageService.runScript<number>({
        script: UPDATE_RECORD_EXPORT_SCRIPT,
        keys: [
          this.getRecordKey(workspaceId, id),
          this.getActiveKey(workspaceId),
        ],
        args: [
          id,
          JSON.stringify(condition),
          JSON.stringify({ ...changes, updatedAt: new Date() }),
          String(
            changes.status === RecordExportStatus.COMPLETED
              ? RECORD_EXPORT_DOWNLOAD_TTL_MS
              : 0,
          ),
        ],
      })) === 1
    );
  }

  private getRecordKey(workspaceId: string, id: string): string {
    return `{${workspaceId}}:export:${id}`;
  }

  private getActiveKey(workspaceId: string): string {
    return `{${workspaceId}}:active`;
  }

  async delete(workspaceId: string, id: string): Promise<void> {
    await this.cacheStorageService.runScript({
      script: DELETE_RECORD_EXPORT_SCRIPT,
      keys: [
        this.getRecordKey(workspaceId, id),
        this.getActiveKey(workspaceId),
      ],
      args: [id],
    });
  }
}
