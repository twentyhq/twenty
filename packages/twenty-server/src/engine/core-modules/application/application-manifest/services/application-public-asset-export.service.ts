import { APPLICATION_EXPORT_FILE_BUDGET_BYTES } from 'src/engine/core-modules/application/application-manifest/constants/application-export-file-budget-bytes.constant';
import { type ApplicationExportFileBudget } from 'src/engine/core-modules/application/application-manifest/types/application-export-file-budget.type';
import { Injectable } from '@nestjs/common';

import { createHash } from 'crypto';
import { basename, extname } from 'path';

import { ASSETS_DIR, type AssetManifest } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { Like } from 'typeorm';

import {
  type ApplicationExportFile,
  type ApplicationExportFileCoverageEntry,
} from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { StreamSizeExceededError } from 'src/utils/stream-size-exceeded-error';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

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
    fileBudget = { remainingBytes: APPLICATION_EXPORT_FILE_BUDGET_BYTES },
  }: {
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
    fileBudget?: ApplicationExportFileBudget;
  }): Promise<{
    publicAssets: AssetManifest[];
    files: ApplicationExportFile[];
    coverage: ApplicationExportFileCoverageEntry[];
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
    const coverage: ApplicationExportFileCoverageEntry[] = [];

    for (const storedFile of storedFiles) {
      const path = storedFile.path.slice(`${FileFolder.PublicAsset}/`.length);
      let content: Buffer;
      try {
        content = await streamToBuffer(
          await this.fileStorageService.readFile({
            workspaceId,
            applicationUniversalIdentifier,
            fileFolder: FileFolder.PublicAsset,
            resourcePath: path,
          }),
          fileBudget.remainingBytes,
        );
        const encodedBytes =
          Buffer.byteLength(
            JSON.stringify({
              folder: FileFolder.PublicAsset,
              path,
              content: content.toString('base64'),
            }),
          ) + 1;
        if (encodedBytes > fileBudget.remainingBytes) {
          throw new StreamSizeExceededError(fileBudget.remainingBytes);
        }
        fileBudget.remainingBytes -= encodedBytes;
      } catch (error) {
        if (!(error instanceof StreamSizeExceededError)) {
          throw error;
        }
        coverage.push({
          metadataName: 'file',
          universalIdentifier: storedFile.id,
          status: ApplicationExportCoverageStatus.UNSUPPORTED,
          reason: `${path} exceeds the remaining shared file export budget (12 MiB encoded total).`,
        });
        continue;
      }

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

    return { publicAssets, files, coverage };
  }
}
