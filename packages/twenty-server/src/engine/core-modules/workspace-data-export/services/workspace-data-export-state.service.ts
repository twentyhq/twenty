import { Injectable, Logger } from '@nestjs/common';

import { Readable } from 'stream';
import { isDefined } from 'twenty-shared/utils';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type WorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-state.type';
import { buildWorkspaceDataExportResource } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-resource.util';
import { parseWorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/utils/parse-workspace-data-export-state.util';

type StateKey = { workspaceId: string; exportId: string };

@Injectable()
export class WorkspaceDataExportStateService {
  private readonly logger = new Logger(WorkspaceDataExportStateService.name);

  constructor(private readonly fileStorageService: FileStorageService) {}

  async get(key: StateKey): Promise<WorkspaceDataExportState | undefined> {
    try {
      const stream = await this.fileStorageService.readFile(
        buildWorkspaceDataExportResource({ ...key, file: { type: 'state' } }),
      );
      const chunks: Buffer[] = [];

      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }

      const { state, error } = parseWorkspaceDataExportState(
        Buffer.concat(chunks).toString('utf8'),
      );

      if (isDefined(error)) {
        this.logger.error(
          `Workspace ${key.workspaceId}: export ${key.exportId} has an unreadable state file: ${error}`,
        );
      }

      return state;
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        return undefined;
      }

      throw error;
    }
  }

  async set({
    state,
    ...key
  }: StateKey & { state: WorkspaceDataExportState }): Promise<void> {
    await this.fileStorageService.writeFileStream({
      ...buildWorkspaceDataExportResource({ ...key, file: { type: 'state' } }),
      stream: Readable.from([Buffer.from(JSON.stringify(state), 'utf8')]),
      mimeType: 'application/json',
    });
  }
}
