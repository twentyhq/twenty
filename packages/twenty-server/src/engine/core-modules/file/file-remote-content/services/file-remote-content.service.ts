import { Injectable, Logger } from '@nestjs/common';

import { type Readable } from 'stream';
import { isDefined } from 'twenty-shared/utils';

import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { RemoteFileOriginResolverRegistryService } from 'src/engine/core-modules/file/file-remote-content/services/remote-file-origin-resolver-registry.service';

@Injectable()
export class FileRemoteContentService {
  private readonly logger = new Logger(FileRemoteContentService.name);

  constructor(
    private readonly remoteFileOriginResolverRegistryService: RemoteFileOriginResolverRegistryService,
  ) {}

  async openRemoteContent({
    file,
    workspaceId,
  }: {
    file: Pick<FileEntity, 'id' | 'mimeType' | 'remoteOrigin'>;
    workspaceId: string;
  }): Promise<{ stream: Readable; mimeType: string } | null> {
    if (!isDefined(file.remoteOrigin)) {
      return null;
    }

    const stream = await this.remoteFileOriginResolverRegistryService
      .getHandlerOrThrow(file.remoteOrigin.originType)
      .fetchRemoteContent({
        workspaceId,
        remoteOrigin: file.remoteOrigin,
      });

    if (!isDefined(stream)) {
      this.logger.warn(
        `Remote content of file ${file.id} is no longer available in workspace ${workspaceId}`,
      );

      return null;
    }

    return {
      stream,
      mimeType: file.mimeType,
    };
  }
}
