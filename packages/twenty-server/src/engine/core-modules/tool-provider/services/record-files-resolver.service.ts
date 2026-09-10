import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import {
  collectFileIdsFromFilesFieldValue,
  substituteFileIdsInFilesFieldValue,
} from 'src/engine/core-modules/tool-provider/utils/files-field-value-file-ids.util';
import { isCopyableFilesFieldSourcePath } from 'src/engine/core-modules/tool-provider/utils/is-copyable-files-field-source-path.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

export type RecordFilesResolution = {
  records: Record<string, unknown>[];
  notes: string[];
};

@Injectable()
export class RecordFilesResolverService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly filesFieldService: FilesFieldService,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
  ) {}

  async resolveRecordsInput({
    objectNameSingular,
    records,
    workspaceId,
  }: {
    objectNameSingular: string;
    records: Record<string, unknown>[];
    workspaceId: string;
  }): Promise<RecordFilesResolution> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const flatObjectMetadata = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).find(
      (metadata): metadata is FlatObjectMetadata =>
        isDefined(metadata) &&
        metadata.nameSingular === objectNameSingular &&
        metadata.isActive,
    );

    if (!isDefined(flatObjectMetadata)) {
      return { records, notes: [] };
    }

    const filesFields = getFlatFieldsFromFlatObjectMetadata(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    ).filter((field) => field.type === FieldMetadataType.FILES);

    if (filesFields.length === 0) {
      return { records, notes: [] };
    }

    const notes: string[] = [];
    const resolvedRecords: Record<string, unknown>[] = [];

    for (const record of records) {
      let resolvedRecord = record;

      for (const filesField of filesFields) {
        const fileIds = collectFileIdsFromFilesFieldValue(
          resolvedRecord[filesField.name],
        );

        const copyableFileIds = await this.findCopyableFileIds(
          fileIds,
          workspaceId,
        );

        if (copyableFileIds.length === 0) {
          continue;
        }

        const fileIdSubstitutions = new Map<string, string>();

        for (const fileId of copyableFileIds) {
          const copiedFile =
            await this.filesFieldService.copyFileIntoFilesField({
              fileId,
              workspaceId,
              fieldMetadataId: filesField.id,
            });

          fileIdSubstitutions.set(fileId, copiedFile.id);
          notes.push(
            `Uploaded file ${fileId} was stored on ${filesField.name} as file ${copiedFile.id}.`,
          );
        }

        resolvedRecord = {
          ...resolvedRecord,
          [filesField.name]: substituteFileIdsInFilesFieldValue(
            resolvedRecord[filesField.name],
            fileIdSubstitutions,
          ),
        };
      }

      resolvedRecords.push(resolvedRecord);
    }

    return { records: resolvedRecords, notes };
  }

  private async findCopyableFileIds(
    fileIds: string[],
    workspaceId: string,
  ): Promise<string[]> {
    if (fileIds.length === 0) {
      return [];
    }

    const files = await this.fileRepository.find(workspaceId, {
      where: { id: In([...new Set(fileIds)]) },
    });

    return files
      .filter((file) => isCopyableFilesFieldSourcePath(file.path))
      .map((file) => file.id);
  }
}
