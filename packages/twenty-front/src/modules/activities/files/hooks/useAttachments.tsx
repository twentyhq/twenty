import { Attachment } from '@/activities/files/types/Attachment';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

import { ActivityTargetableEntity } from '../../types/ActivityTargetableEntity';

// do we need to test this?
export const useAttachments = (entity: ActivityTargetableEntity) => {
  const { records: attachments } = useFindManyRecords({
    objectNameSingular: 'attachment',
    filter: {
      [entity.type === 'Company' ? 'companyId' : 'personId']: { eq: entity.id },
    },
    orderBy: {
      createdAt: 'DescNullsFirst',
    },
  });

  return {
    attachments: attachments as Attachment[],
  };
};
