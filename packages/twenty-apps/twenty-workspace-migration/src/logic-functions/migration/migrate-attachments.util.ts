import axios, { type AxiosInstance } from "axios";
import { findManyRecords } from "src/logic-functions/requests/find-many-records.util";
import { createManyRecords } from "src/logic-functions/requests/create-many-records.util";
import { createFileUpload } from "src/logic-functions/requests/create-file-upload.util";
import { completeFileUpload } from "src/logic-functions/requests/complete-file-upload.util";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { logger } from "src/logic-functions/utils/logger.util";
import { migrationState } from "src/logic-functions/utils/migration-state.util";
import { setObjectCursor } from "src/logic-functions/utils/set-object-cursor.util";
import { stopIfTimeBudgetExceeded } from "src/logic-functions/utils/time-budget.util";

// Copies a source attachment's underlying file into the target workspace's own storage (files
// are stored workspace-scoped server-side, so reusing the source record's `file.fileId`/path
// verbatim would point at a file that doesn't exist for the target workspace) and only then
// creates the Attachment record pointing at the freshly uploaded copy.
export const migrateAttachments = async (
  sourceWorkspace: AxiosInstance,
  targetWorkspace: AxiosInstance,
  recordIdMap: Map<string, string>,
): Promise<void> => {
  const targetFieldNameByObjectName = migrationState.attachmentTargetFieldNameByObjectName;
  const targetFileFieldId = migrationState.targetAttachmentFileFieldId;
  if (targetFileFieldId === null) {
    logger.warn('Skipping attachments: target workspace has no attachment.file field metadata id');
    return;
  }
  if (targetFieldNameByObjectName.size === 0) {
    logger.warn('Skipping attachments: source workspace has no attachment target fields');
    return;
  }

  const targetForeignKeyNames = Array.from(targetFieldNameByObjectName.values(), (fieldName) => `${fieldName}Id`);
  const selectionSet = `id
${targetForeignKeyNames.join('\n')}
name
file {
  fileId
  label
  extension
  url
}`;

  let createdCount = 0;
  let after: string | null = migrationState.objectRecordsToMigrate.get('attachments') ?? null;

  while (true) {
    const page = await executeWithRetryAndCheckpoint(() => findManyRecords(sourceWorkspace, 'attachments', selectionSet, after, (migrationState.maxRequests / 3)));
    const nodes = page.edges.map((edge) => edge.node);
    if (nodes.length > 0) {
      for (const attachment of nodes) {
        const attachmentId = attachment.id as string;
        const name = attachment.name as string;
        const sourceFile = (attachment.file as {
          fileId: string;
          label: string;
          extension: string;
          url: string
        }[] | null)?.[0];
        if (sourceFile === undefined) {
          logger.warn(`Skipping attachment "${name}": no underlying file`);
          continue;
        }

        const targetFields: Record<string, unknown> = {};
        for (const fieldName of targetFieldNameByObjectName.values()) {
          const foreignKeyName = `${fieldName}Id`;
          const sourceRecordId = attachment[foreignKeyName];
          if (sourceRecordId === null || sourceRecordId === undefined) {
            continue;
          }
          const targetRecordId = recordIdMap.get(sourceRecordId as string);
          if (targetRecordId === undefined) {
            logger.warn(`Attachment "${name}": dropping ${foreignKeyName} - referenced record ${sourceRecordId as string} was not migrated`);
            continue;
          }
          targetFields[foreignKeyName] = targetRecordId;
        }

        if (Object.keys(targetFields).length === 0) {
          logger.warn(`Skipping attachment "${name}": no valid target record in the target workspace`);
          continue;
        }

        try {
          const filename = sourceFile.extension ? `${sourceFile.label}.${sourceFile.extension}` : sourceFile.label;
          const fileBytes = (await executeWithRetryAndCheckpoint(() =>
            axios.get<ArrayBuffer>(sourceFile.url, { responseType: 'arraybuffer' }),
          )).data;

          const uploadTarget = await executeWithRetryAndCheckpoint(() =>
            createFileUpload(targetWorkspace, filename, fileBytes.byteLength, targetFileFieldId),
          );

          await executeWithRetryAndCheckpoint(() =>
            axios.put(uploadTarget.uploadUrl, fileBytes, { headers: { 'Content-Type': uploadTarget.contentType } }),
          );

          await executeWithRetryAndCheckpoint(() => completeFileUpload(targetWorkspace, uploadTarget.fileId));

          await executeWithRetryAndCheckpoint(() => createManyRecords(targetWorkspace, 'attachments', [{
            id: attachmentId,
            name,
            file: [{ fileId: uploadTarget.fileId, label: sourceFile.label }],
            ...targetFields,
          }], new Set()));
          createdCount += 1;
        } catch (error) {
          // An attachment whose file can't be downloaded/re-uploaded can't be meaningfully
          // partially migrated - skip it and move on to the rest.
          logger.warn(`Skipping attachment "${name}": ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }
    if (page.pageInfo.hasNextPage === false) {
      setObjectCursor('attachments', null);
      break;
    }
    after = page.pageInfo.endCursor;
    setObjectCursor('attachments', after);
    if (await stopIfTimeBudgetExceeded()) {
      return;
    }
  }

  logger.log(`Attachments: created ${createdCount}`);
};
