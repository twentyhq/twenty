import { Injectable } from '@nestjs/common';

import { type ObjectRecordDestroyEvent } from 'twenty-shared/database-events';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/workspace-event-emitter/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/workspace-event-emitter/enums/database-event-action';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { extractFilesFieldFileIdsFromRichTextValue } from 'src/engine/core-modules/file/files-field/utils/extract-files-field-file-ids-from-rich-text-value.util';
import {
  FilesFieldDeletionJob,
  FilesFieldDeletionJobData,
} from 'src/engine/core-modules/file/files-field/jobs/files-field-deletion.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

type FileItem = {
  fileId: string;
  label: string;
  extension?: string;
};

@Injectable()
export class FilesFieldDeletionListener {
  constructor(
    @InjectMessageQueue(MessageQueue.deleteCascadeQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  @OnDatabaseBatchEvent('*', DatabaseEventAction.DESTROYED)
  async handleDestroyedEvent(
    payload: WorkspaceEventBatch<ObjectRecordDestroyEvent>,
  ) {
    const workspaceId = payload.workspaceId;
    const objectMetadata = payload.objectMetadata;

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );

    const objectId = idByNameSingular[objectMetadata.nameSingular];

    if (!isDefined(objectId)) {
      return;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      return;
    }

    const objectFields = getFlatFieldsFromFlatObjectMetadata(
      flatObjectMetadata,
      flatFieldMetadataMaps,
    );

    const filesFields = objectFields.filter(
      (field) => field.type === FieldMetadataType.FILES,
    );
    const richTextFields = objectFields.filter(
      (field) => field.type === FieldMetadataType.RICH_TEXT,
    );

    if (filesFields.length === 0 && richTextFields.length === 0) {
      return;
    }

    const fileIds = new Set<string>();
    const recordOwnedFileCandidates: FilesFieldDeletionJobData['recordOwnedFileCandidates'] =
      [];

    for (const event of payload.events) {
      const recordBefore = event.properties.before as Record<string, unknown>;

      for (const filesField of filesFields) {
        const filesValue = recordBefore[filesField.name];

        if (!isDefined(filesValue)) {
          continue;
        }

        const fileItems = filesValue as FileItem[];

        for (const fileItem of fileItems) {
          if (!isDefined(fileItem.fileId)) {
            continue;
          }

          fileIds.add(fileItem.fileId);
        }
      }

      for (const richTextField of richTextFields) {
        for (const fileId of extractFilesFieldFileIdsFromRichTextValue(
          recordBefore[richTextField.name],
        )) {
          recordOwnedFileCandidates.push({ fileId, recordId: event.recordId });
        }
      }
    }

    if (fileIds.size > 0 || recordOwnedFileCandidates.length > 0) {
      await this.messageQueueService.add<FilesFieldDeletionJobData>(
        FilesFieldDeletionJob.name,
        {
          workspaceId,
          fileIds: Array.from(fileIds),
          recordOwnedFileCandidates,
        },
        {
          workspaceId,
          isWorkspaceJob: true,
        },
      );
    }
  }
}
