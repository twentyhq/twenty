import { type Attachment } from '@/activities/files/types/Attachment';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { isAttachmentTargetFieldDefined } from '@/activities/utils/isAttachmentTargetFieldDefined';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
export const useAttachments = (targetableObject: ActivityTargetableObject) => {
  const { objectMetadataItem: attachmentObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Attachment,
    });

  const targetableObjectFieldIdName = getActivityTargetObjectFieldIdName({
    nameSingular: targetableObject.targetObjectNameSingular,
  });

  const hasAttachmentTargetField = isAttachmentTargetFieldDefined({
    objectNameSingular: targetableObject.targetObjectNameSingular,
    attachmentFields: attachmentObjectMetadataItem.fields,
  });

  const { records: attachments, loading } = useFindManyRecords<Attachment>({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    filter: {
      [targetableObjectFieldIdName]: {
        eq: targetableObject.id,
      },
    },
    orderBy: [
      {
        createdAt: 'DescNullsFirst',
      },
    ],
    skip: !hasAttachmentTargetField,
  });

  return {
    attachments,
    loading,
  };
};
