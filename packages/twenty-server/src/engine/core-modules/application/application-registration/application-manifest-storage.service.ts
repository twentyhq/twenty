import { Injectable, Logger } from '@nestjs/common';

import { type Manifest } from 'twenty-shared/application';
import { ServerFileFolder } from 'twenty-shared/types';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { buildApplicationManifestResourcePath } from 'src/engine/core-modules/application/application-registration/utils/build-application-manifest-resource-path.util';
import { ServerFileStorageService } from 'src/engine/core-modules/file-storage/services/server-file-storage.service';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class ApplicationManifestStorageService {
  private readonly logger = new Logger(ApplicationManifestStorageService.name);

  constructor(
    private readonly serverFileStorageService: ServerFileStorageService,
  ) {}

  async writeManifest({
    applicationRegistrationId,
    manifest,
    sourceType,
    version,
  }: {
    applicationRegistrationId: string;
    manifest: Manifest;
    sourceType: ApplicationRegistrationSourceType;
    version?: string | null;
  }): Promise<FileEntity> {
    const serializedManifest = JSON.stringify(manifest);

    const resourcePath = buildApplicationManifestResourcePath({
      applicationRegistrationId,
      sourceType,
      version,
      serializedManifest,
    });

    return this.serverFileStorageService.writeServerFile({
      fileFolder: ServerFileFolder.ApplicationRegistration,
      resourcePath,
      contents: serializedManifest,
      mimeType: 'application/json',
      applicationRegistrationId,
    });
  }

  async readManifest(serverFileId: string): Promise<Manifest | null> {
    try {
      const stream =
        await this.serverFileStorageService.readServerFileById(serverFileId);

      const content = (await streamToBuffer(stream)).toString('utf-8');

      return JSON.parse(content) as Manifest;
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        this.logger.warn(`Manifest server file ${serverFileId} not found`);

        return null;
      }

      throw error;
    }
  }
}
