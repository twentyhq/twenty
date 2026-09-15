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
import { type RecordExport } from 'src/engine/core-modules/record-export/types/record-export.type';

@Injectable()
export class RecordExportStreamWorkspaceService {
  constructor(
    private readonly recordExportCacheService: RecordExportCacheService,
    private readonly recordExportWorkspaceService: RecordExportWorkspaceService,
  ) {}

  async stream({
    parameters,
    authContext,
  }: {
    parameters: RecordExportParameters;
    authContext: WorkspaceAuthContext;
  }): Promise<AsyncIterableIterator<RecordExportDTO>> {
    const abortController = new AbortController();
    const service = this;
    const recordExport = await this.recordExportWorkspaceService.create({
      parameters,
      authContext,
    });
    let downloadReady = false;
    let connectionError: unknown;
    let cleanup: Promise<void> | undefined;
    const close = () => {
      abortController.abort();
      if (!downloadReady) {
        cleanup ??= service.recordExportWorkspaceService.cancel(recordExport);
      }
      return cleanup ?? Promise.resolve();
    };
    const keepAlive = async (created: RecordExport) => {
      try {
        while (!abortController.signal.aborted) {
          await setTimeout(RECORD_EXPORT_PROGRESS_INTERVAL_MS, undefined, {
            signal: abortController.signal,
          });
          const current = await service.recordExportCacheService.findOne({
            workspaceId: created.workspaceId,
            id: created.id,
            keepAlive: true,
          });
          if (
            !isDefined(current) ||
            current.expiresAt.getTime() <= Date.now()
          ) {
            throw new BadRequestException(
              t`The export was interrupted. Please try again.`,
            );
          }
          if (
            current.status === RecordExportStatus.COMPLETED ||
            current.status === RecordExportStatus.FAILED
          ) {
            return;
          }
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          connectionError = error;
          await close();
        }
      }
    };

    const heartbeat = keepAlive(recordExport).catch((error: unknown) => {
      connectionError = error;
    });
    try {
      await this.recordExportWorkspaceService.enqueue(recordExport);
      if (isDefined(connectionError)) {
        throw connectionError;
      }
    } catch (error) {
      await close();
      await heartbeat;
      throw error;
    }

    async function* events(): AsyncGenerator<RecordExportDTO> {
      try {
        while (!abortController.signal.aborted) {
          const current =
            await service.recordExportWorkspaceService.findOrThrow(
              recordExport,
            );
          const updated =
            await service.recordExportWorkspaceService.reconcile(current);
          if (abortController.signal.aborted) {
            break;
          }
          if (updated.status === RecordExportStatus.COMPLETED) {
            const downloadUrl =
              await service.recordExportWorkspaceService.getDownloadUrl({
                id: updated.id,
                authContext,
              });
            if (abortController.signal.aborted) {
              break;
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
            signal: abortController.signal,
          });
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          throw error;
        }
      } finally {
        await close();
        await heartbeat;
      }
      if (isDefined(connectionError)) {
        throw connectionError;
      }
    }
    const iterator = events();
    return {
      next: () => iterator.next(),
      return: async () => {
        try {
          await close();
        } finally {
          await iterator.return(undefined);
        }
        return { done: true, value: undefined };
      },
      throw: async (error: unknown) => {
        try {
          await close();
        } finally {
          await iterator.return(undefined);
        }
        throw error;
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }
}
