import { Attachment } from '@/activities/files/types/Attachment';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';

import { ActivityTargetableEntity } from '../../types/ActivityTargetableEntity';

export const useAttachments = (entity: ActivityTargetableEntity) => {
  const { objects: attachments } = useFindManyObjectRecords({
    objectNamePlural: 'attachments',
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
