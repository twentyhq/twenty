import { Attachment } from '@/activities/files/types/Attachment';
import { getTargetableObjectFilterFieldName } from '@/activities/utils/getTargetObjectFilterFieldName';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

import { ActivityTargetableObject } from '../../types/ActivityTargetableEntity';

// do we need to test this?
export const useAttachments = (targetableObject: ActivityTargetableObject) => {
  const targetableObjectFilterFieldName = getTargetableObjectFilterFieldName({
    targetableObject: targetableObject,
  });

  const { records: attachments } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    filter: {
      [targetableObjectFilterFieldName]: {
        eq: targetableObject.id,
      },
    },
    orderBy: {
      createdAt: 'DescNullsFirst',
    },
  });

  return {
    attachments: attachments as Attachment[],
  };
};
