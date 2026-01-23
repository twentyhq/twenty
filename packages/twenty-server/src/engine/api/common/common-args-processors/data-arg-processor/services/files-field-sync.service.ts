import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import path from 'path';

import { msg } from '@lingui/core/macro';
import {
  FieldMetadataType,
  FileFolder,
  ObjectRecord,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import {
  AddOrUpdateFileItemInput,
  FileItemOutput,
  RemoveFileItemInput,
} from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.type';
import {
  EnrichedFilesFieldInput,
  FilesFieldInput,
} from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-files-field-or-throw.util';
import { PartialObjectRecordWithId } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/types/partial-object-record-with-id.type';
import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FilesFieldService } from 'src/engine/core-modules/file/services/files-field.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type PartialRecordWithId = Partial<ObjectRecord> & { id: string };

@Injectable()
export class FilesFieldSyncService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly fileStorageService: FileStorageService,
    private readonly filesFieldService: FilesFieldService,
  ) {}

  async enrichDataArgsAndValidateFiles({
    flatObjectMetadata,
    flatFieldMetadataMaps,
    data,
    workspaceId,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    data: Partial<ObjectRecord>[];
    workspaceId: string;
  }): Promise<void> {
    const filesFields = this.getFilesFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    if (filesFields.length === 0) {
      return;
    }

    const toAddFileIds: string[] = [];
    const toRemoveFileIds: string[] = [];

    for (const record of data) {
      for (const filesField of filesFields) {
        const fieldValue = record[filesField.name] as FilesFieldInput | null;

        if (!isDefined(fieldValue)) {
          continue;
        }

        if (isDefined(fieldValue.addFiles)) {
          toAddFileIds.push(...fieldValue.addFiles.map((file) => file.fileId));
        }
        if (isDefined(fieldValue.removeFiles)) {
          toRemoveFileIds.push(
            ...fieldValue.removeFiles.map((file) => file.fileId),
          );
        }
      }
    }

    if (toAddFileIds.length === 0 && toRemoveFileIds.length === 0) {
      return;
    }

    if ([...new Set(toAddFileIds)].length !== toAddFileIds.length) {
      throw new CommonQueryRunnerException(
        'Duplicate file IDs found',
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`A fileId cannot be associated with multiple FILES field values`,
        },
      );
    }

    const existingFiles = await this.fileRepository.find({
      where: {
        id: In([...toAddFileIds, ...toRemoveFileIds]),
        workspaceId,
      },
      select: ['id', 'path'],
    });

    const existingFileIds = existingFiles.map((file) => file.id);
    const missingFileIds = [...toAddFileIds, ...toRemoveFileIds].filter(
      (fileId) => !existingFileIds.includes(fileId),
    );

    if (missingFileIds.length > 0) {
      const missingFileIdsString = missingFileIds.join(', ');

      throw new CommonQueryRunnerException(
        `FileId(s) not found: ${missingFileIdsString}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`FileId(s) not found: ${missingFileIdsString}`,
        },
      );
    }

    this.enrichDataArgsWithFileExtension({
      data,
      fileEntities: existingFiles,
      flatObjectMetadata,
      flatFieldMetadataMaps,
    });
  }

  private enrichDataArgsWithFileExtension({
    data,
    fileEntities,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  }: {
    data: Partial<ObjectRecord>[];
    fileEntities: FileEntity[];
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): void {
    const filesFields = this.getFilesFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    for (const record of data) {
      for (const filesField of filesFields) {
        const fieldValue = record[filesField.name] as FilesFieldInput | null;

        if (!isDefined(fieldValue)) {
          continue;
        }

        if (isDefined(fieldValue.addFiles)) {
          for (const addFile of fieldValue.addFiles) {
            this.validateAndEnrichToAddFileItem(addFile, fileEntities);
          }
        }
        if (isDefined(fieldValue.updateFiles)) {
          for (const updateFile of fieldValue.updateFiles) {
            this.validateAndEnrichToUpdateFileItem(updateFile, fileEntities);
          }
        }
        if (isDefined(fieldValue.removeFiles)) {
          for (const removeFile of fieldValue.removeFiles) {
            this.validateToRemoveFileItem(removeFile, fileEntities);
          }
        }
      }
    }
  }

  private getFilesFields(
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): FlatFieldMetadata[] {
    const objectFields = getFlatFieldsFromFlatObjectMetadata(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    return objectFields.filter(
      (field) => field.type === FieldMetadataType.FILES,
    );
  }

  private validateAndEnrichToAddFileItem(
    toAddFileItem: AddOrUpdateFileItemInput,
    fileEntities: FileEntity[],
  ): void {
    const fileId = toAddFileItem.fileId;

    const fileEntity = fileEntities.find((file) => file.id === fileId);

    if (!isDefined(fileEntity)) {
      throw new CommonQueryRunnerException(
        `File not found: ${fileId}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`File not found: ${fileId}`,
        },
      );
    }

    if (!fileEntity.path.includes(FileFolder.TemporaryFilesField)) {
      throw new CommonQueryRunnerException(
        `File should be a temporary files field file: ${fileId}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`${fileId} file is already associated with a permanent files field. Re-upload the file.`,
        },
      );
    }

    (toAddFileItem as FileItemOutput).extension = path.extname(fileEntity.path);
  }

  private validateAndEnrichToUpdateFileItem(
    toAddFileItem: AddOrUpdateFileItemInput,
    fileEntities: FileEntity[],
  ): void {
    const fileId = toAddFileItem.fileId;

    const fileEntity = fileEntities.find((file) => file.id === fileId);

    if (!isDefined(fileEntity)) {
      throw new CommonQueryRunnerException(
        `File not found: ${fileId}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`File not found: ${fileId}`,
        },
      );
    }

    if (fileEntity.path.includes(FileFolder.TemporaryFilesField)) {
      throw new CommonQueryRunnerException(
        `File to update should not be a temporary files field file: ${fileId}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: STANDARD_ERROR_MESSAGE,
        },
      );
    }

    (toAddFileItem as FileItemOutput).extension = path.extname(fileEntity.path);
  }

  private validateToRemoveFileItem(
    toRemoveFileItem: RemoveFileItemInput,
    fileEntities: FileEntity[],
  ): void {
    const fileId = toRemoveFileItem.fileId;

    const fileEntity = fileEntities.find((file) => file.id === fileId);

    if (!isDefined(fileEntity)) {
      throw new CommonQueryRunnerException(
        `File not found: ${fileId}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`File not found: ${fileId}`,
        },
      );
    }

    if (fileEntity.path.includes(FileFolder.TemporaryFilesField)) {
      throw new CommonQueryRunnerException(
        `File to remove should not be a temporary files field file: ${fileId}`,
        CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
        {
          userFriendlyMessage: msg`${fileId} file to remove is temporary. It should be a permanent file.`,
        },
      );
    }
  }

  prepareFilesFieldsBeforeInsert({
    data,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  }: {
    data: Partial<ObjectRecord>[];
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): void {
    const filesFields = this.getFilesFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    if (filesFields.length === 0) {
      return;
    }

    for (const record of data) {
      for (const filesField of filesFields) {
        const fieldValue = record[
          filesField.name
        ] as EnrichedFilesFieldInput | null;

        if (!isDefined(fieldValue)) {
          continue;
        }

        if (
          isNonEmptyArray(fieldValue.removeFiles) ||
          isNonEmptyArray(fieldValue.updateFiles)
        ) {
          const filesFieldName = filesField.name;

          throw new CommonQueryRunnerException(
            `Files field "${filesField.name}" removeFiles/updateFiles are not supported for insert.`,
            CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
            {
              userFriendlyMessage: msg`Files field "${filesFieldName}" removeFiles/updateFiles are not supported for insert.`,
            },
          );
        }

        if (isNonEmptyArray(fieldValue.addFiles)) {
          record[filesField.name] = fieldValue.addFiles;
        }
      }
    }
  }

  prepareFilesFieldsBeforeUpdateInUpsert({
    data,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    existingRecords,
  }: {
    data: PartialObjectRecordWithId[];
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    existingRecords: PartialObjectRecordWithId[];
  }): void {
    const filesFields = this.getFilesFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    if (filesFields.length === 0) {
      return;
    }

    for (const record of data) {
      const recordId = record.id;

      const existingRecord = existingRecords.find(
        (existing) => existing.id === recordId,
      );

      if (!isDefined(existingRecord)) {
        throw new CommonQueryRunnerException(
          `Record not found for update: ${recordId}`,
          CommonQueryRunnerExceptionCode.INVALID_ARGS_DATA,
          {
            userFriendlyMessage: msg`Record not found for update: ${recordId}`,
          },
        );
      }

      this.applyFilesFieldUpdates(record, existingRecord, filesFields);
    }
  }

  prepareFilesFieldsBeforeUpdateOne({
    data,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    existingRecord,
  }: {
    data: Partial<ObjectRecord>;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    existingRecord: PartialObjectRecordWithId;
  }): void {
    const filesFields = this.getFilesFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    if (filesFields.length === 0) {
      return;
    }

    this.applyFilesFieldUpdates(data, existingRecord, filesFields);
  }

  private applyFilesFieldUpdates(
    data: Partial<ObjectRecord>,
    existingRecord: Partial<ObjectRecord>,
    filesFields: FlatFieldMetadata[],
  ): void {
    for (const filesField of filesFields) {
      const fieldValue = data[
        filesField.name
      ] as EnrichedFilesFieldInput | null;

      if (!isDefined(fieldValue)) {
        continue;
      }

      const existingFiles = (existingRecord[filesField.name] ??
        []) as FileItemOutput[];

      const fileIdsToRemove = [
        ...(fieldValue.removeFiles ?? []),
        ...(fieldValue.updateFiles ?? []),
      ].map((file) => file.fileId);

      const filesAfterRemoval = existingFiles.filter(
        (file) => !fileIdsToRemove.includes(file.fileId),
      );

      const filesToUpdate = fieldValue.updateFiles ?? [];
      const filesToAdd = fieldValue.addFiles ?? [];

      data[filesField.name] = [
        ...filesAfterRemoval,
        ...filesToUpdate,
        ...filesToAdd,
      ];
    }
  }

  hasFilesFieldToUpdate(
    data: Partial<ObjectRecord>,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): boolean {
    const filesFields = this.getFilesFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    return filesFields.some((filesField) => {
      const fieldValue = data[
        filesField.name
      ] as EnrichedFilesFieldInput | null;

      return isDefined(fieldValue);
    });
  }

  async syncFileEntities({
    data,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    workspaceId,
    workspaceCustomApplicationId,
  }: {
    data: Partial<ObjectRecord>[];
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    workspaceId: string;
    workspaceCustomApplicationId: string;
  }): Promise<void> {
    const filesFields = this.getFilesFields(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    if (filesFields.length === 0) {
      return;
    }

    const operations: Promise<void>[] = [];

    for (const record of data) {
      for (const filesField of filesFields) {
        const fieldValue = record[
          filesField.name
        ] as EnrichedFilesFieldInput | null;

        if (!isDefined(fieldValue)) {
          continue;
        }

        if (isDefined(fieldValue.removeFiles)) {
          for (const removeFile of fieldValue.removeFiles) {
            operations.push(
              this.filesFieldService.deleteFilesFieldFile({
                fileId: removeFile.fileId,
                workspaceId,
                applicationId: filesField.applicationId,
              }),
            );
          }
        }

        if (isDefined(fieldValue.addFiles)) {
          for (const addFile of fieldValue.addFiles) {
            operations.push(
              this.filesFieldService.moveFileFromTemporaryFilesFieldFolder({
                fileId: addFile.fileId,
                workspaceId,
                applicationId: filesField.applicationId,
                workspaceCustomApplicationId,
              }),
            );
          }
        }
      }
    }

    await Promise.all(operations);
  }
}
