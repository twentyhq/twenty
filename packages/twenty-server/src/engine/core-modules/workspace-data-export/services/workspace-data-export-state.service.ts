import { Injectable } from '@nestjs/common';

import { Readable } from 'stream';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type WorkspaceDataExportState } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-state.type';
import { buildWorkspaceDataExportStateResource } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-resource.util';

type StateKey = { workspaceId: string; exportId: string };

@Injectable()
export class WorkspaceDataExportStateService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async get(key: StateKey): Promise<WorkspaceDataExportState | undefined> {
    try {
      const stream = await this.fileStorageService.readFile(
        buildWorkspaceDataExportStateResource(key),
      );
      const chunks: Buffer[] = [];

      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }

      return JSON.parse(Buffer.concat(chunks).toString('utf8'));
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

  async set(key: StateKey, state: WorkspaceDataExportState): Promise<void> {
    await this.fileStorageService.writeFileStream({
      ...buildWorkspaceDataExportStateResource(key),
      stream: Readable.from([Buffer.from(JSON.stringify(state), 'utf8')]),
      mimeType: 'application/json',
    });
  }
}
