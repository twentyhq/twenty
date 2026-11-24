import { getAttachmentTargetJoinColumnName } from '@/activities/files/utils/getAttachmentTargetJoinColumnName';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { StandardObjectNameSingular } from 'twenty-shared/types';

export const useAttachmentTargetJoinColumnName = (
  targetObjectNameSingular: string,
) => {
  const { objectMetadataItem: attachmentObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: StandardObjectNameSingular.Attachment,
    });
  const { objectMetadataItems } = useObjectMetadataItems();

  return getAttachmentTargetJoinColumnName({
    attachmentObjectMetadataItem,
    targetObjectNameSingular,
    objectMetadataItems,
  });
};
