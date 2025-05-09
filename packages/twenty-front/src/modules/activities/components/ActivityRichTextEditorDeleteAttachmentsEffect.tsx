import { Attachment } from '@/activities/files/types/Attachment';
import { isActivityAttachmentDeletionCheckNeededState } from '@/activities/states/shouldCheckForAttachmentToDeleteFamilyState';
import { Note } from '@/activities/types/Note';
import { Task } from '@/activities/types/Task';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

type ActivityRichTextEditorDeleteAttachmentsEffectProps = {
  activityId: string;
};

type Activity = (Task | Note) & {
  attachments: Attachment[];
};

export const ActivityRichTextEditorDeleteAttachmentsEffect = ({
  activityId,
}: ActivityRichTextEditorDeleteAttachmentsEffectProps) => {
  const { deleteManyRecords } = useDeleteManyRecords({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const checkAndDeleteAttachments = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const isCheckNeeded = snapshot
          .getLoadable(isActivityAttachmentDeletionCheckNeededState)
          .getValue();

        if (!isCheckNeeded) {
          return;
        }

        set(isActivityAttachmentDeletionCheckNeededState, false);

        const activity = snapshot
          .getLoadable(recordStoreFamilyState(activityId))
          .getValue() as Activity;

        const activityAttachments = activity?.attachments;

        if (
          !isDefined(activityAttachments) ||
          activityAttachments.length === 0
        ) {
          return;
        }

        const activityAttachmentIdsToDelete = activityAttachments
          .filter((attachment) => {
            return !activity?.bodyV2?.blocknote?.includes(
              attachment.fullPath.split('?')[0],
            );
          })
          .map((attachment) => attachment.id);

        if (activityAttachmentIdsToDelete.length === 0) {
          return;
        }

        deleteManyRecords({
          recordIdsToDelete: activityAttachmentIdsToDelete,
        });
      },
    [deleteManyRecords, activityId],
  );

  useEffect(() => {
    return () => {
      checkAndDeleteAttachments();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]); // activityId in array only means this effect only runs on mount/unmount or when activityId changes

  return <></>;
};
