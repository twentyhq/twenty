import axios, { type AxiosInstance } from "axios";
import { findManyRecords } from "src/logic-functions/requests/find-many-records.util";
import { createManyRecords } from "src/logic-functions/requests/create-many-records.util";
import { createFileUpload } from "src/logic-functions/requests/create-file-upload.util";
import { completeFileUpload } from "src/logic-functions/requests/complete-file-upload.util";
import { FindAllObjectsAndFields } from "src/logic-functions/requests/find-all-objects-and-fields.util";
import { extractNodes } from "src/logic-functions/utils/extract-nodes.util";
import { executeWithRetryAndCheckpoint } from "src/logic-functions/utils/execute-with-retry-and-checkpoint.util";
import { logger } from "src/logic-functions/utils/logger.util";

const TARGET_FIELD_NAME_PREFIX = 'target';

const decapitalize = (value: string): string =>
  value.length === 0 ? value : value[0].toLowerCase() + value.slice(1);

const readAllRecords = async (client: AxiosInstance, selectionSet: string) => {
  const nodes: Record<string, unknown>[] = [];
  let after: string | null = null;
  while (true) {
    const page = await findManyRecords(client, 'attachments', selectionSet, after);
    nodes.push(...page.edges.map((edge) => edge.node));
    if (!page.pageInfo.hasNextPage) {
      break;
    }
    after = page.pageInfo.endCursor;
  }
  return nodes;
};

type AttachmentTargetInfo = {
  fileFieldId: string | undefined;
  targetFieldNameByObjectName: Map<string, string>;
};

const findAttachmentTargetInfo = async (client: AxiosInstance): Promise<AttachmentTargetInfo> => {
  const { data } = await executeWithRetryAndCheckpoint(() => FindAllObjectsAndFields(client));
  const objects = extractNodes(data.objects);
  const isSystemByNameSingular = new Map(objects.map((object) => [object.nameSingular, object.isSystem]));
  const attachmentObject = objects.find((object) => object.nameSingular === 'attachment');

  const targetFieldNameByObjectName = new Map<string, string>();
  for (const field of attachmentObject?.fieldsList ?? []) {
    if (!field.name.startsWith(TARGET_FIELD_NAME_PREFIX) || field.name === TARGET_FIELD_NAME_PREFIX) {
      continue;
    }
    const objectNameSingular = decapitalize(field.name.slice(TARGET_FIELD_NAME_PREFIX.length));
    // isSystemByNameSingular.get(...) is undefined for a name that didn't round-trip to a real
    // object - treated the same as isSystem: true, i.e. excluded either way.
    if (isSystemByNameSingular.get(objectNameSingular) !== false) {
      continue;
    }
    targetFieldNameByObjectName.set(objectNameSingular, field.name);
  }

  return {
    fileFieldId: attachmentObject?.fieldsList.find((field) => field.name === 'file')?.id,
    targetFieldNameByObjectName,
  };
};

// Copies a source attachment's underlying file into the target workspace's own storage (files
// are stored workspace-scoped server-side, so reusing the source record's `file.fileId`/path
// verbatim would point at a file that doesn't exist for the target workspace) and only then
// creates the Attachment record pointing at the freshly uploaded copy.
export const migrateAttachments = async (
  sourceWorkspace: AxiosInstance,
  targetWorkspace: AxiosInstance,
  recordIdMap: Map<string, string>,
): Promise<void> => {
  const { targetFieldNameByObjectName } = await findAttachmentTargetInfo(sourceWorkspace);
  const { fileFieldId: targetFileFieldId } = await findAttachmentTargetInfo(targetWorkspace);
  if (targetFileFieldId === undefined) {
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

  const sourceAttachments = await readAllRecords(sourceWorkspace, selectionSet);
  const targetAttachments = await readAllRecords(targetWorkspace, 'id');
  const existingTargetAttachmentIds = new Set(targetAttachments.map((node) => node.id as string));

  let createdCount = 0;

  for (const attachment of sourceAttachments) {
    const attachmentId = attachment.id as string;
    const name = attachment.name as string;

    if (existingTargetAttachmentIds.has(attachmentId)) {
      continue;
    }

    const sourceFile = (attachment.file as { fileId: string; label: string; extension: string; url: string }[] | null)?.[0];
    if (sourceFile === undefined) {
      logger.warn(`Skipping attachment "${name}": no underlying file`);
      continue;
    }

    const targetFields: Record<string, unknown> = {};
    for (const [objectNameSingular, fieldName] of targetFieldNameByObjectName) {
      const foreignKeyName = `${fieldName}Id`;
      const sourceRecordId = attachment[foreignKeyName];
      if (sourceRecordId === null || sourceRecordId === undefined) {
        continue;
      }
      // dashboard reuses its source id verbatim in the target workspace (see
      // migrateDashboards), so it's the one target object that never gets an entry in
      // recordIdMap - everything else (standard or custom) goes through the generic Stage 5
      // record loop and resolves normally, or is dropped with a warning if it wasn't migrated
      // (e.g. workflow, which this tool never migrates at all).
      if (objectNameSingular === 'dashboard') {
        targetFields[foreignKeyName] = sourceRecordId;
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

  logger.log(`Attachments: created ${createdCount}`);
};
