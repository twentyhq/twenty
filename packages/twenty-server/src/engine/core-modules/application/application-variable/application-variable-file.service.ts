import { Injectable, Logger } from '@nestjs/common';

import path from 'path';

import { msg } from '@lingui/core/macro';
import {
  type ApplicationVariableFileValue,
  isApplicationVariableFileValue,
  parseApplicationVariableFilesValue,
} from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import {
  ApplicationVariableEntityException,
  ApplicationVariableEntityExceptionCode,
} from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export type ApplicationVariableFilesValueUpdate = {
  plaintextValueToStore: string;
  fileIdsToBind: string[];
  fileIdsToDelete: string[];
};

@Injectable()
export class ApplicationVariableFileService {
  private readonly logger = new Logger(ApplicationVariableFileService.name);

  constructor(
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly fileStorageService: FileStorageService,
    private readonly fileUrlService: FileUrlService,
  ) {}

  // Urls are minted on every read instead of being stored: private ones expire,
  // and even permanent ones depend on the current signing key.
  async signFilesValue({
    plaintextValue,
    workspaceId,
    isPublic,
  }: {
    plaintextValue: string;
    workspaceId: string;
    isPublic: boolean;
  }): Promise<string> {
    const files = parseApplicationVariableFilesValue(plaintextValue);

    if (files.length === 0) {
      return '';
    }

    const signedFiles = await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await this.fileUrlService.signFileByIdUrl({
          fileId: file.fileId,
          workspaceId,
          fileFolder: FileFolder.ApplicationVariable,
          isPermanent: isPublic,
        }),
      })),
    );

    return JSON.stringify(signedFiles);
  }

  async prepareFilesValueUpdate({
    applicationId,
    workspaceId,
    previousPlaintextValue,
    nextPlaintextValue,
  }: {
    applicationId: string;
    workspaceId: string;
    previousPlaintextValue: string;
    nextPlaintextValue: string;
  }): Promise<ApplicationVariableFilesValueUpdate> {
    const nextFiles = this.parseSubmittedFilesValueOrThrow(nextPlaintextValue);
    const previousFileById = new Map(
      parseApplicationVariableFilesValue(previousPlaintextValue).map((file) => [
        file.fileId,
        file,
      ]),
    );
    const nextFileIds = new Set(nextFiles.map(({ fileId }) => fileId));

    const fileIdsToBind = nextFiles
      .filter(({ fileId }) => !previousFileById.has(fileId))
      .map(({ fileId }) => fileId);
    const fileIdsToDelete = [...previousFileById.keys()].filter(
      (fileId) => !nextFileIds.has(fileId),
    );

    const uploadedFileById = await this.findUploadedFilesToBindOrThrow({
      fileIds: fileIdsToBind,
      applicationId,
      workspaceId,
    });

    const filesToStore = nextFiles.map(({ fileId, label }) => {
      const uploadedFile = uploadedFileById.get(fileId);

      return {
        fileId,
        label,
        extension: isDefined(uploadedFile)
          ? path.extname(uploadedFile.path)
          : previousFileById.get(fileId)?.extension,
      };
    });

    return {
      plaintextValueToStore:
        filesToStore.length === 0 ? '' : JSON.stringify(filesToStore),
      fileIdsToBind,
      fileIdsToDelete,
    };
  }

  async applyFilesValueUpdate({
    fileIdsToBind,
    fileIdsToDelete,
    workspaceId,
  }: Pick<
    ApplicationVariableFilesValueUpdate,
    'fileIdsToBind' | 'fileIdsToDelete'
  > & {
    workspaceId: string;
  }): Promise<void> {
    if (fileIdsToBind.length > 0) {
      await this.fileRepository.update(
        workspaceId,
        { id: In(fileIdsToBind) },
        { settings: { isTemporaryFile: false, toDelete: false } },
      );
    }

    for (const fileId of fileIdsToDelete) {
      try {
        await this.fileStorageService.deleteByFileId({
          fileId,
          workspaceId,
          fileFolder: FileFolder.ApplicationVariable,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to delete file ${fileId} dropped from an application variable in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  private parseSubmittedFilesValueOrThrow(
    plaintextValue: string,
  ): ApplicationVariableFileValue[] {
    if (plaintextValue === '') {
      return [];
    }

    let parsedValue: unknown;

    try {
      parsedValue = JSON.parse(plaintextValue);
    } catch {
      throw this.buildInvalidFilesValueException(
        'Application variable files value is not valid JSON',
      );
    }

    if (
      !Array.isArray(parsedValue) ||
      !parsedValue.every(isApplicationVariableFileValue)
    ) {
      throw this.buildInvalidFilesValueException(
        'Application variable files value must be a list of files',
      );
    }

    const fileIds = parsedValue.map(({ fileId }) => fileId);

    if (new Set(fileIds).size !== fileIds.length) {
      throw this.buildInvalidFilesValueException(
        'Application variable files value lists the same file twice',
      );
    }

    return parsedValue;
  }

  private async findUploadedFilesToBindOrThrow({
    fileIds,
    applicationId,
    workspaceId,
  }: {
    fileIds: string[];
    applicationId: string;
    workspaceId: string;
  }): Promise<Map<string, FileEntity>> {
    if (fileIds.length === 0) {
      return new Map();
    }

    const files = await this.fileRepository.find(workspaceId, {
      where: { id: In(fileIds) },
    });
    const fileById = new Map(files.map((file) => [file.id, file]));

    for (const fileId of fileIds) {
      const file = fileById.get(fileId);

      if (
        !isDefined(file) ||
        file.applicationId !== applicationId ||
        !file.path.startsWith(`${FileFolder.ApplicationVariable}/`)
      ) {
        throw this.buildInvalidFilesValueException(
          `File ${fileId} was not uploaded for an application variable of this application`,
          msg`File ${fileId} was not uploaded for this application. Please upload it again.`,
        );
      }

      // Direct uploads stay PENDING until the client confirms the bytes landed in storage.
      if (file.status !== FILE_STATUS.UPLOADED) {
        throw this.buildInvalidFilesValueException(
          `File ${fileId} upload has not been completed`,
          msg`File ${fileId} upload has not been completed. Please retry the upload.`,
        );
      }

      if (!file.settings?.isTemporaryFile) {
        throw this.buildInvalidFilesValueException(
          `File ${fileId} is already bound to a variable`,
          msg`File ${fileId} is already used by another variable. Please upload it again.`,
        );
      }
    }

    return fileById;
  }

  private buildInvalidFilesValueException(
    message: string,
    userFriendlyMessage = msg`Invalid files value for this application variable.`,
  ): ApplicationVariableEntityException {
    return new ApplicationVariableEntityException(
      message,
      ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
      { userFriendlyMessage },
    );
  }
}
