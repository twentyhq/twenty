import { type AttachmentType } from '@/activities/files/types/Attachment';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ThemeColor } from 'twenty-ui/theme';

export const useAttachmentTypeColors = (): Record<
  AttachmentType,
  ThemeColor
> => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const typeField = objectMetadataItem.fields.find(
    (field) => field.name === 'type',
  );

  let colorMap: Record<AttachmentType, ThemeColor> = {} as Record<
    AttachmentType,
    ThemeColor
  >;

  if (typeField?.options !== undefined && typeField.options !== null) {
    typeField.options.forEach((option) => {
      const attachmentType = option.value as AttachmentType;
      colorMap[attachmentType] = option.color;
    });
  }

  return colorMap;
};
