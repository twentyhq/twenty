import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Readable } from 'stream';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { FileFolder } from 'twenty-shared/types';
import { Like, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  FilesFieldTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FilesFieldFileDTO } from 'src/engine/core-modules/file/files-field/dtos/files-field-file.dto';
import { extractFileInfo } from 'src/engine/core-modules/file/utils/extract-file-info.utils';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { sanitizeFile } from 'src/engine/core-modules/file/utils/sanitize-file.utils';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

import {
  FilesFieldException,
  FilesFieldExceptionCode,
} from './files-field.exception';

@Injectable()
export class FilesFieldService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly jwtWrapperService: JwtWrapperService,
  ) {}

  async uploadFile({
    file,
    filename,
    workspaceId,
    fieldMetadataId,
  }: {
    file: Buffer;
    filename: string;
    workspaceId: string;
    fieldMetadataId: string;
  }): Promise<FilesFieldFileDTO> {
    const { mimeType, ext } = await extractFileInfo({
      file,
      filename,
    });

    const sanitizedFile = sanitizeFile({ file, ext, mimeType });

    const fileId = v4();
    const name = `${fileId}${isNonEmptyString(ext) ? `.${ext}` : ''}`;

    const fieldMetadata = await this.fieldMetadataRepository.findOneOrFail({
      select: ['applicationId', 'universalIdentifier'],
      where: {
        id: fieldMetadataId,
        workspaceId,
      },
    });

    const application = await this.applicationRepository.findOneOrFail({
      where: {
        id: fieldMetadata.applicationId,
        workspaceId,
      },
    });

    const savedFile = await this.fileStorageService.writeFile({
      sourceFile: sanitizedFile,
      resourcePath: `${fieldMetadata.universalIdentifier}/${name}`,
      mimeType,
      fileFolder: FileFolder.FilesField,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId,
      fileId,
      settings: {
        isTemporaryFile: true,
        toDelete: false,
      },
    });

    return {
      ...savedFile,
      url: this.signFileUrl({ fileId, workspaceId }),
    };
  }

  async deleteFilesFieldFile({
    fileId,
    workspaceId,
  }: {
    fileId: string;
    workspaceId: string;
  }): Promise<void> {
    try {
      await this.fileStorageService.deleteByFileId({
        fileId,
        workspaceId,
        fileFolder: FileFolder.FilesField,
      });
    } catch (error) {
      throw new FilesFieldException(
        `Failed to delete file ${fileId}: ${error.message}`,
        FilesFieldExceptionCode.FILE_DELETION_FAILED,
        {
          userFriendlyMessage: msg`Failed to delete file ${fileId}`,
        },
      );
    }
  }

  async getFileStream({
    fileId,
    workspaceId,
  }: {
    fileId: string;
    workspaceId: string;
  }): Promise<Readable> {
    const file = await this.fileRepository.findOneOrFail({
      where: {
        id: fileId,
        path: Like(`${FileFolder.FilesField}/%`),
        workspaceId,
      },
    });

    if (file.settings?.isTemporaryFile === true) {
      throw new FilesFieldException(
        `File ${fileId} is not associated with a permanent files field`,
        FilesFieldExceptionCode.TEMPORARY_FILE_NOT_ALLOWED,
        {
          userFriendlyMessage: msg`File ${fileId} is not associated with a files field. It can't be downloaded.`,
        },
      );
    }

    const application = await this.applicationRepository.findOneOrFail({
      where: {
        id: file.applicationId,
        workspaceId,
      },
    });

    return await this.fileStorageService.readFile({
      resourcePath: removeFileFolderFromFileEntityPath(file.path),
      fileFolder: FileFolder.FilesField,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId,
    });
  }

  signFileUrl(
    payloadToEncode: Omit<FilesFieldTokenJwtPayload, 'type' | 'sub'>,
  ) {
    const fileTokenExpiresIn = this.twentyConfigService.get(
      'FILE_TOKEN_EXPIRES_IN',
    );

    const payload: FilesFieldTokenJwtPayload = {
      ...payloadToEncode,
      sub: payloadToEncode.workspaceId,
      type: JwtTokenTypeEnum.FILE,
    };

    const secret = this.jwtWrapperService.generateAppSecret(
      payload.type,
      payloadToEncode.workspaceId,
    );

    const token = this.jwtWrapperService.sign(payload, {
      secret,
      expiresIn: fileTokenExpiresIn,
    });

    return `${process.env.SERVER_URL}/files-field/${payloadToEncode.fileId}?token=${token}`;
  }
}
