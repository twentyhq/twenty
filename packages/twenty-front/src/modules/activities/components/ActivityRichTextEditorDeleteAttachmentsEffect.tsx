import { Attachment } from '@/activities/files/types/Attachment';
import { isActivityAttachmentDeletionCheckNeededState } from '@/activities/states/shouldCheckForAttachmentToDeleteFamilyState';
import { Note } from '@/activities/types/Note';
import { Task } from '@/activities/types/Task';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
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
  const [activityInStore] = useRecoilState(recordStoreFamilyState(activityId));
  const activity = activityInStore as Activity | null;
  const [
    isActivityAttachmentDeletionCheckNeeded,
    setIsActivityAttachmentDeletionCheckNeeded,
  ] = useRecoilState(isActivityAttachmentDeletionCheckNeededState);

  const { deleteManyRecords } = useDeleteManyRecords({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  useEffect(() => {
    console.log('run mount');

    return () => {
      console.log('run unmount');
      if (!isActivityAttachmentDeletionCheckNeeded) {
        console.log('no need to check for attachments to delete');
        return;
      }
      console.log('setting isActivityAttachmentDeletionCheckNeeded to false');
      setIsActivityAttachmentDeletionCheckNeeded(false);

      const activityAttachments = activity?.attachments;
      if (!isDefined(activityAttachments) || activityAttachments.length === 0) {
        console.log('no attachments to delete 1');
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
        console.log('no attachments to delete 2');
        return;
      }

      console.log('deleteManyRecords', activityAttachmentIdsToDelete);
      deleteManyRecords({
        recordIdsToDelete: activityAttachmentIdsToDelete,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]); // activityId in array only means this effect only runs on mount/unmount or

  return <></>;
};
