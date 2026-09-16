import { BadRequestException, Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { setTimeout } from 'node:timers/promises';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RECORD_EXPORT_PROGRESS_INTERVAL_MS } from 'src/engine/core-modules/record-export/constants/record-export.constants';
import { type RecordExportDTO } from 'src/engine/core-modules/record-export/dtos/record-export.dto';
import { RecordExportStatus } from 'src/engine/core-modules/record-export/enums/record-export-status.enum';
import { RecordExportCacheService } from 'src/engine/core-modules/record-export/services/record-export-cache.service';
import { RecordExportWorkspaceService } from 'src/engine/core-modules/record-export/services/record-export.workspace-service';
import { type RecordExportParameters } from 'src/engine/core-modules/record-export/types/record-export-parameters.type';
import { wrapAsyncIteratorWithLifecycle } from 'src/engine/subscriptions/utils/wrap-async-iterator-with-lifecycle';

@Injectable()
export class RecordExportStreamWorkspaceService {
  constructor(
    private readonly recordExportCacheService: RecordExportCacheService,
    private readonly recordExportWorkspaceService: RecordExportWorkspaceService,
  ) {}

  async stream({
    parameters,
    authContext,
    requestTokenHash,
  }: {
    parameters: RecordExportParameters;
    authContext: WorkspaceAuthContext;
    requestTokenHash: string;
  }): Promise<AsyncIterableIterator<RecordExportDTO>> {
    const service = this;
    const recordExport = await this.recordExportWorkspaceService.create({
      parameters,
      authContext,
      requestTokenHash,
    });
    let downloadReady = false;

    async function* events(
      signal: AbortSignal,
    ): AsyncGenerator<RecordExportDTO> {
      while (!signal.aborted) {
        const current =
          await service.recordExportWorkspaceService.findOrThrow(recordExport);
        const updated =
          await service.recordExportWorkspaceService.reconcile(current);
        if (signal.aborted) {
          return;
        }
        if (updated.status === RecordExportStatus.COMPLETED) {
          const downloadUrl =
            await service.recordExportWorkspaceService.getDownloadUrl({
              id: updated.id,
              authContext,
            });
          if (signal.aborted) {
            return;
          }
          downloadReady = true;
          yield { ...updated, downloadUrl };
          return;
        }
        yield updated;
        if (updated.status === RecordExportStatus.FAILED) {
          return;
        }
        await setTimeout(RECORD_EXPORT_PROGRESS_INTERVAL_MS, undefined, {
          signal,
        });
      }
    }

    const stream = wrapAsyncIteratorWithLifecycle(events, {
      heartbeatStart: 'immediate',
      heartbeatErrorBehavior: 'close',
      heartbeatIntervalMs: RECORD_EXPORT_PROGRESS_INTERVAL_MS,
      onHeartbeat: async () => {
        const current = await this.recordExportCacheService.findOne({
          workspaceId: recordExport.workspaceId,
          id: recordExport.id,
          keepAlive: true,
        });
        if (!isDefined(current) || current.expiresAt.getTime() <= Date.now()) {
          throw new BadRequestException(
            t`The export was interrupted. Please try again.`,
          );
        }
        return (
          current.status !== RecordExportStatus.COMPLETED &&
          current.status !== RecordExportStatus.FAILED
        );
      },
      onCleanup: async () => {
        if (!downloadReady) {
          await this.recordExportWorkspaceService.cancel(recordExport);
        }
      },
    });
    try {
      await this.recordExportWorkspaceService.enqueue(recordExport);
    } catch (error) {
      await stream.return?.();
      throw error;
    }
    return stream;
  }
}
