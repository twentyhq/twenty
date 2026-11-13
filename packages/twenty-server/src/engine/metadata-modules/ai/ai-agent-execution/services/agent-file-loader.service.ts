import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { type AgentRunFileLoader } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-file-loader.type';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class AgentFileLoaderService {
  private readonly logger = new Logger(AgentFileLoaderService.name);

  constructor(private readonly fileService: FileService) {}

  createRunFileLoader({
    workspaceId,
    maxFileSizeBytes,
  }: {
    workspaceId: string;
    maxFileSizeBytes: number;
  }): AgentRunFileLoader {
    const filesByUrl = new Map<string, Promise<FileEntity | null>>();
    const fileIdsByBytes = new WeakMap<Uint8Array, string>();
    const unreadableFileUrls = new Set<string>();

    const loadFile = (url: string) => {
      const loadedFile = filesByUrl.get(url);

      if (isDefined(loadedFile)) {
        return loadedFile;
      }

      const fileLoad = this.fileService.getFileBySignedUrl({
        fileUrl: url,
        workspaceId,
      });

      filesByUrl.set(url, fileLoad);

      return fileLoad;
    };

    return {
      loadFile,
      loadFileBytes: async (url) => {
        const file = await loadFile(url);
        const fileBytes = isDefined(file)
          ? await this.readFileBytes({ file, workspaceId, maxFileSizeBytes })
          : null;

        if (!isDefined(file) || !isDefined(fileBytes)) {
          unreadableFileUrls.add(url);

          return null;
        }

        unreadableFileUrls.delete(url);
        fileIdsByBytes.set(fileBytes, file.id);

        return fileBytes;
      },
      getFileIdOfBytes: (fileBytes) => fileIdsByBytes.get(fileBytes),
      isFileUnreadable: (url) => unreadableFileUrls.has(url),
    };
  }

  private async readFileBytes({
    file,
    workspaceId,
    maxFileSizeBytes,
  }: {
    file: FileEntity;
    workspaceId: string;
    maxFileSizeBytes: number;
  }): Promise<Buffer | null> {
    try {
      const fileContent = await this.fileService.getFileStream({
        file,
        workspaceId,
      });

      return isDefined(fileContent)
        ? await streamToBuffer(fileContent.stream, maxFileSizeBytes)
        : null;
    } catch (error) {
      this.logger.warn(`Could not read file ${file.id} for the model`, error);

      return null;
    }
  }
}
