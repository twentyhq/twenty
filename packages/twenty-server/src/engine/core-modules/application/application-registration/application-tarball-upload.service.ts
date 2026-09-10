import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationTarballService } from 'src/engine/core-modules/application/application-registration/application-tarball.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUploadTargetDTO } from 'src/engine/core-modules/file/file-upload/dtos/file-upload-target.dto';
import { FileUploadCompletionService } from 'src/engine/core-modules/file/file-upload/services/file-upload-completion.service';
import { FileUploadTargetService } from 'src/engine/core-modules/file/file-upload/services/file-upload-target.service';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const STAGED_TARBALL_DIRECTORY = 'staged-uploads';

const TARBALL_FILE_SETTINGS = {
  isTemporaryFile: false,
  toDelete: false,
} as const;

@Injectable()
export class ApplicationTarballUploadService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationTarballService: ApplicationTarballService,
    private readonly fileStorageService: FileStorageService,
    private readonly fileUploadTargetService: FileUploadTargetService,
    private readonly fileUploadCompletionService: FileUploadCompletionService,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
  ) {}

  async createUploadApplicationTarball({
    workspaceId,
    size,
  }: {
    workspaceId: string;
    size: number;
  }): Promise<FileUploadTargetDTO> {
    const applicationUniversalIdentifier =
      await this.getWorkspaceApplicationUniversalIdentifier(workspaceId);

    const [result] =
      await this.fileUploadTargetService.createUploadTargetsBatch([
        {
          workspaceId,
          applicationUniversalIdentifier,
          fileFolder: FileFolder.AppTarball,
          resourcePath: `${STAGED_TARBALL_DIRECTORY}/${v4()}/app.tar.gz`,
          size,
          settings: TARBALL_FILE_SETTINGS,
        },
      ]);

    if (!result.success) {
      throw new ApplicationRegistrationException(
        result.error,
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    return result.value;
  }

  async completeUploadApplicationTarball({
    workspaceId,
    fileId,
    universalIdentifier,
  }: {
    workspaceId: string;
    fileId: string;
    universalIdentifier?: string;
  }): Promise<ApplicationRegistrationEntity> {
    const applicationUniversalIdentifier =
      await this.getWorkspaceApplicationUniversalIdentifier(workspaceId);

    const file = await this.fileRepository.findOne(workspaceId, {
      where: { id: fileId },
    });

    if (
      !isDefined(file) ||
      !file.path.startsWith(
        `${FileFolder.AppTarball}/${STAGED_TARBALL_DIRECTORY}/`,
      )
    ) {
      throw new ApplicationRegistrationException(
        `No staged tarball upload found for file ${fileId}`,
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    const [result] =
      await this.fileUploadCompletionService.completeUploadsBatch([
        { workspaceId, applicationUniversalIdentifier, file },
      ]);

    if (!result.success) {
      throw new ApplicationRegistrationException(
        result.error,
        ApplicationRegistrationExceptionCode.INVALID_INPUT,
      );
    }

    const stream = await this.fileStorageService.readFile({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.AppTarball,
      resourcePath: removeFileFolderFromFileEntityPath(file.path),
    });

    return this.applicationTarballService.uploadTarball({
      tarballBuffer: await streamToBuffer(stream),
      tarballFileId: file.id,
      universalIdentifier,
      ownerWorkspaceId: workspaceId,
    });
  }

  private async getWorkspaceApplicationUniversalIdentifier(
    workspaceId: string,
  ): Promise<string> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    return workspaceCustomFlatApplication.universalIdentifier;
  }
}
