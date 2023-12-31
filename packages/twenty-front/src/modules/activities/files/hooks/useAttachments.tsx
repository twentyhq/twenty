import { Attachment } from '@/activities/files/types/Attachment';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

import { ActivityTargetableEntity } from '../../types/ActivityTargetableEntity';

// do we need to test this?
export const useAttachments = (entity: ActivityTargetableEntity) => {
  const { records: attachments } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Attachment,
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
