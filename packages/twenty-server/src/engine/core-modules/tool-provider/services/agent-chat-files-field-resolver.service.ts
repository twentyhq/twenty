import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/services/files-field.service';
import {
  collectFileIdsFromFilesFieldValue,
  substituteFileIdsInFilesFieldValue,
} from 'src/engine/core-modules/tool-provider/utils/files-field-value-file-ids.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type AgentChatFilesResolution = {
  records: Record<string, unknown>[];
  notes: string[];
};

@Injectable()
export class AgentChatFilesFieldResolverService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly filesFieldService: FilesFieldService,
  ) {}

  async resolveRecordsInput({
    objectNameSingular,
    records,
    workspaceId,
  }: {
    objectNameSingular: string;
    records: Record<string, unknown>[];
    workspaceId: string;
  }): Promise<AgentChatFilesResolution> {
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

        if (fileIds.length === 0) {
          continue;
        }

        const fileIdSubstitutions =
          await this.filesFieldService.prepareAgentChatFilesForFilesField({
            fileIds,
            workspaceId,
            fieldMetadataId: filesField.id,
          });

        if (fileIdSubstitutions.size === 0) {
          continue;
        }

        resolvedRecord = {
          ...resolvedRecord,
          [filesField.name]: substituteFileIdsInFilesFieldValue(
            resolvedRecord[filesField.name],
            fileIdSubstitutions,
          ),
        };

        for (const [uploadedFileId, copiedFileId] of fileIdSubstitutions) {
          notes.push(
            `Chat upload ${uploadedFileId} was stored on ${filesField.name} as file ${copiedFileId}.`,
          );
        }
      }

      resolvedRecords.push(resolvedRecord);
    }

    return { records: resolvedRecords, notes };
  }
}
