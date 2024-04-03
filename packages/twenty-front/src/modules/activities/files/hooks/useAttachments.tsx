import { Attachment } from '@/activities/files/types/Attachment';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

// do we need to test this?
export const useAttachments = (targetableObject: ActivityTargetableObject) => {
  const targetableObjectFieldIdName = getActivityTargetObjectFieldIdName({
    nameSingular: targetableObject.targetObjectNameSingular,
  });

  const { records: attachments } = useFindManyRecords<Attachment>({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    filter: {
      [targetableObjectFieldIdName]: {
        eq: targetableObject.id,
      },
    },
    orderBy: {
      createdAt: 'DescNullsFirst',
    },
  });

  return {
    attachments,
  };
};
