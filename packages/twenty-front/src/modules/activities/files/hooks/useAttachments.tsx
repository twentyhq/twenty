import { type Attachment } from '@/activities/files/types/Attachment';
import { useAttachmentTargetJoinColumnName } from '@/activities/files/hooks/useAttachmentTargetJoinColumnName';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
export const useAttachments = (targetableObject: ActivityTargetableObject) => {
  const attachmentTargetJoinColumnName = useAttachmentTargetJoinColumnName(
    targetableObject.targetObjectNameSingular,
  );

  const {
    records: attachments,
    loading,
    totalCount,
  } = useFindManyRecords<Attachment>({
    objectNameSingular: StandardObjectNameSingular.Attachment,
    filter: isDefined(attachmentTargetJoinColumnName)
      ? { [attachmentTargetJoinColumnName]: { eq: targetableObject.id } }
      : undefined,
    orderBy: [
      {
        createdAt: 'DescNullsFirst',
      },
    ],
    skip: !isDefined(attachmentTargetJoinColumnName),
  });

  return {
    attachments,
    loading,
    totalCountAttachments: totalCount,
  };
};
