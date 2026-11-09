import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { AI_READABLE_FILE_FOLDERS } from 'src/engine/core-modules/tool/constants/ai-readable-file-folders.constant';
import { type AgentRunFileLoader } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-file-loader.type';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class AgentFileLoaderService {
  private readonly logger = new Logger(AgentFileLoaderService.name);

  constructor(
    private readonly fileUrlService: FileUrlService,
    private readonly fileService: FileService,
  ) {}

  createRunFileLoader({
    workspaceId,
    maxFileSizeBytes,
  }: {
    workspaceId: string;
    maxFileSizeBytes: number;
  }): AgentRunFileLoader {
    const filesByUrl = new Map<string, Promise<FileEntity | null>>();
    const bytesByFileId = new Map<string, Promise<Buffer | null>>();

    const loadFile = (url: string) =>
      this.loadOnce({
        cache: filesByUrl,
        key: url,
        load: () => this.findFileBySignedUrl({ url, workspaceId }),
      });

    return {
      loadFile,
      loadFileBytes: async (url) => {
        const file = await loadFile(url);

        return isDefined(file)
          ? this.loadOnce({
              cache: bytesByFileId,
              key: file.id,
              load: () =>
                this.readFileBytes({ file, workspaceId, maxFileSizeBytes }),
            })
          : null;
      },
      getLoadedFileBytes: async (url) => {
        const file = await loadFile(url);

        return isDefined(file) ? bytesByFileId.get(file.id) : null;
      },
    };
  }

  private loadOnce<TValue>({
    cache,
    key,
    load,
  }: {
    cache: Map<string, Promise<TValue>>;
    key: string;
    load: () => Promise<TValue>;
  }): Promise<TValue> {
    const loadedValue = cache.get(key);

    if (isDefined(loadedValue)) {
      return loadedValue;
    }

    const valueLoad = load();

    cache.set(key, valueLoad);

    return valueLoad;
  }

  private async findFileBySignedUrl({
    url,
    workspaceId,
  }: {
    url: string;
    workspaceId: string;
  }): Promise<FileEntity | null> {
    const fileId = await this.fileUrlService.getFileIdFromSignedFileUrl({
      fileUrl: url,
      workspaceId,
    });

    return isDefined(fileId)
      ? this.fileService.getFileById({
          fileId,
          workspaceId,
          allowedFileFolders: AI_READABLE_FILE_FOLDERS,
        })
      : null;
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
      const fileContent = await this.fileService.getFileStreamById({
        fileId: file.id,
        workspaceId,
        allowedFileFolders: AI_READABLE_FILE_FOLDERS,
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
