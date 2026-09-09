import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationTarballService } from 'src/engine/core-modules/application/application-registration/application-tarball.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

@Injectable()
export class ApplicationTarballUploadService {
  private readonly logger = new Logger(ApplicationTarballUploadService.name);

  constructor(
    private readonly applicationTarballService: ApplicationTarballService,
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
  ) {}

  async publishAppTarball({
    workspaceId,
    fileId,
    universalIdentifier,
  }: {
    workspaceId: string;
    fileId: string;
    universalIdentifier?: string;
  }): Promise<ApplicationRegistrationEntity> {
    const file = await this.fileRepository.findOne(workspaceId, {
      where: { id: fileId },
    });

    if (
      !isDefined(file) ||
      !file.path.startsWith(`${FileFolder.AppTarball}/`) ||
      file.status !== FILE_STATUS.UPLOADED
    ) {
      throw new ApplicationRegistrationException(
        `No uploaded tarball found for file ${fileId}`,
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    const application = await this.applicationRepository.findOne({
      where: { id: file.applicationId, workspaceId },
    });

    if (!isDefined(application)) {
      throw new ApplicationRegistrationException(
        `No application namespace found for file ${fileId}`,
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    const resourcePath = removeFileFolderFromFileEntityPath(file.path);

    try {
      const stream = await this.fileStorageService.readFile({
        workspaceId,
        applicationUniversalIdentifier: application.universalIdentifier,
        fileFolder: FileFolder.AppTarball,
        resourcePath,
      });

      return await this.applicationTarballService.uploadTarball({
        tarballBuffer: await streamToBuffer(stream),
        universalIdentifier,
        ownerWorkspaceId: workspaceId,
      });
    } finally {
      await this.discardUploadedTarball({
        workspaceId,
        applicationUniversalIdentifier: application.universalIdentifier,
        resourcePath,
        fileId,
      });
    }
  }

  // uploadTarball re-writes the archive at its final, registration-scoped path,
  // so the uploaded copy is dead weight once it has been read back.
  private async discardUploadedTarball({
    workspaceId,
    applicationUniversalIdentifier,
    resourcePath,
    fileId,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    resourcePath: string;
    fileId: string;
  }): Promise<void> {
    try {
      await this.fileStorageService.deleteFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.AppTarball,
        resourcePath,
      });

      await this.fileRepository.delete(workspaceId, { id: fileId });
    } catch (error) {
      this.logger.warn(
        `Failed to discard uploaded tarball ${fileId}: ${error.message}`,
      );
    }
  }
}
