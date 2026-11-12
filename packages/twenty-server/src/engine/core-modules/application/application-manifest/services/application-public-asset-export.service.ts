import { Injectable } from '@nestjs/common';

import { createHash } from 'crypto';
import { basename, extname } from 'path';

import { ASSETS_DIR, type AssetManifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { Like } from 'typeorm';

import { type ApplicationExportFile } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const MAX_PUBLIC_ASSET_EXPORT_BYTES = 12 * 1024 * 1024;

@Injectable()
export class ApplicationPublicAssetExportService {
  constructor(
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async exportPublicAssets({
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
  }): Promise<{
    publicAssets: AssetManifest[];
    files: ApplicationExportFile[];
  }> {
    const storedFiles = await this.fileRepository.find(workspaceId, {
      where: {
        applicationId,
        path: Like(`${FileFolder.PublicAsset}/${ASSETS_DIR}/%`),
        status: FILE_STATUS.UPLOADED,
      },
      order: { path: 'ASC' },
    });
    const publicAssets: AssetManifest[] = [];
    const files: ApplicationExportFile[] = [];

    let remainingBytes = MAX_PUBLIC_ASSET_EXPORT_BYTES;

    for (const storedFile of storedFiles) {
      const path = storedFile.path.slice(`${FileFolder.PublicAsset}/`.length);
      const content = await streamToBuffer(
        await this.fileStorageService.readFile({
          workspaceId,
          applicationUniversalIdentifier,
          fileFolder: FileFolder.PublicAsset,
          resourcePath: path,
        }),
        remainingBytes,
      );
      remainingBytes -= content.length;

      publicAssets.push({
        filePath: path,
        fileName: basename(path),
        fileType: extname(path).slice(1),
        checksum: createHash('md5').update(content).digest('hex'),
      });
      files.push({
        folder: FileFolder.PublicAsset,
        path,
        content: content.toString('base64'),
      });
    }

    return { publicAssets, files };
  }
}
