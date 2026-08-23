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
import { RecordIdResolution, resolveTargetRecordId } from "src/logic-functions/utils/record-id-resolution.util";
import { REQUESTS_PER_ATTACHMENT, decrementEstimate } from "src/logic-functions/utils/estimate-migration-duration.util";

// Copies a source attachment's underlying file into the target workspace's own storage (files
// are stored workspace-scoped server-side, so reusing the source record's `file.fileId`/path
// verbatim would point at a file that doesn't exist for the target workspace) and only then
// creates the Attachment record pointing at the freshly uploaded copy.
export const migrateAttachments = async (
  sourceWorkspace: AxiosInstance,
  targetWorkspace: AxiosInstance,
  recordIds: RecordIdResolution,
): Promise<boolean> => {
  const targetFieldNameByObjectName = migrationState.attachmentTargetFieldNameByObjectName;
  const targetFileFieldId = migrationState.targetAttachmentFileFieldId;
  if (targetFileFieldId === null) {
    logger.warn('Skipping attachments: target workspace has no attachment.file field metadata id');
    return true;
  }
  if (targetFieldNameByObjectName.size === 0) {
    logger.warn('Skipping attachments: source workspace has no attachment target fields');
    return true;
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
    const page = await executeWithRetryAndCheckpoint(() => findManyRecords(sourceWorkspace, 'attachments', selectionSet, after, (migrationState.maxRequests / 2) - 1));
    const nodes = page.edges.map((edge) => edge.node);
    if (nodes.length > 0) {
      const attachmentsToCreate: Record<string, unknown>[] = [];
      for (const attachment of nodes) {
        const attachmentId = attachment.id as string;
        const name = attachment.name as string;
        decrementEstimate({ otherRecordCount: REQUESTS_PER_ATTACHMENT });
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
          const targetRecordId = resolveTargetRecordId(recordIds, sourceRecordId as string);
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

          attachmentsToCreate.push({
            id: attachmentId,
            name,
            file: [{ fileId: uploadTarget.fileId, label: sourceFile.label }],
            ...targetFields,
          });
        } catch (error) {
          // An attachment whose file can't be downloaded/re-uploaded can't be meaningfully
          // partially migrated - skip it and move on to the rest.
          logger.warn(`Skipping attachment "${name}": ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      if (attachmentsToCreate.length > 0) {
        // Batching trades per-attachment error isolation for one request per page, so a single
        // rejected row now costs the whole page - contain it here rather than letting it abort
        // the stage, since the files themselves are already uploaded either way.
        try {
          await executeWithRetryAndCheckpoint(() => createManyRecords(targetWorkspace, 'attachments', attachmentsToCreate, new Set()));
          createdCount += attachmentsToCreate.length;
        } catch (error) {
          logger.warn(`Skipping ${attachmentsToCreate.length} attachment(s) in this page: ${error instanceof Error ? error.message : String(error)}`);
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
      return false;
    }
  }

  logger.log(`Attachments: created ${createdCount}`);
  return true;
};
