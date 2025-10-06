import { type Attachment } from '@/activities/files/types/Attachment';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export const useAttachmentsByIds = (attachmentIds: string[]) => {
  const hasIds = attachmentIds && attachmentIds.length > 0;

  const { records: attachments, loading } = useFindManyRecords<Attachment>({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    filter: {
      id: {
        in: attachmentIds,
      },
    },
    skip: !hasIds,
  });

  return {
    attachments: hasIds ? attachments : [],
    loading,
  };
};
