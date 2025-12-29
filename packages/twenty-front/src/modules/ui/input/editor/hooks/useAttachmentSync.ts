import { type Attachment } from '@/activities/files/types/Attachment';
import { filterAttachmentsToRestore } from '@/activities/utils/filterAttachmentsToRestore';
import { getActivityAttachmentIdsAndNameToUpdate } from '@/activities/utils/getActivityAttachmentIdsAndNameToUpdate';
import { getActivityAttachmentIdsToDelete } from '@/activities/utils/getActivityAttachmentIdsToDelete';
import { getActivityAttachmentPathsToRestore } from '@/activities/utils/getActivityAttachmentPathsToRestore';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { useRestoreManyRecords } from '@/object-record/hooks/useRestoreManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

export const useAttachmentSync = (attachments: Attachment[]) => {
  const { deleteManyRecords: deleteAttachments } = useDeleteManyRecords({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const { restoreManyRecords: restoreAttachments } = useRestoreManyRecords({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const { fetchAllRecords: findSoftDeletedAttachments } =
    useLazyFetchAllRecords({
      objectNameSingular: CoreObjectNameSingular.Attachment,
      filter: {
        deletedAt: {
          is: 'NOT_NULL',
        },
      },
    });

  const { updateOneRecord: updateOneAttachment } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const syncAttachments = async (
    newBody: string,
    previousBody?: string | null,
  ) => {
    if (!newBody) return;

    const previousBodyOrEmptyArray = previousBody?.trim() ? previousBody : '[]';

    const attachmentIdsToDelete = getActivityAttachmentIdsToDelete(
      newBody,
      attachments,
      previousBodyOrEmptyArray,
    );

    if (attachmentIdsToDelete.length > 0) {
      await deleteAttachments({
        recordIdsToDelete: attachmentIdsToDelete,
      });
    }

    const attachmentPathsToRestore = getActivityAttachmentPathsToRestore(
      newBody,
      attachments,
    );

    if (attachmentPathsToRestore.length > 0) {
      const softDeletedAttachments =
        (await findSoftDeletedAttachments()) as Attachment[];

      const attachmentIdsToRestore = filterAttachmentsToRestore(
        attachmentPathsToRestore,
        softDeletedAttachments ?? [],
      );

      await restoreAttachments({
        idsToRestore: attachmentIdsToRestore,
      });
    }

    const attachmentsToUpdate = getActivityAttachmentIdsAndNameToUpdate(
      newBody,
      attachments,
    );

    for (const attachmentToUpdate of attachmentsToUpdate) {
      if (!attachmentToUpdate.id || !attachmentToUpdate.name) continue;
      await updateOneAttachment({
        idToUpdate: attachmentToUpdate.id,
        updateOneRecordInput: { name: attachmentToUpdate.name },
      });
    }
  };

  return { syncAttachments };
};
