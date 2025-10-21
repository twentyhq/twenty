import { type AttachmentFileCategory } from '@/activities/files/types/AttachmentFileCategory';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useTheme } from '@emotion/react';
import { isDefined } from 'twenty-shared/utils';
import { type ThemeColor } from 'twenty-ui/theme';

export const useFileCategoryColors = (): Record<
  AttachmentFileCategory,
  string
> => {
  const theme = useTheme();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const fileCategoryField = objectMetadataItem.fields.find(
    (field) => field.name === 'fileCategory',
  );

  const colorMap: Record<AttachmentFileCategory, string> = {
    ARCHIVE: theme.color.gray,
    AUDIO: theme.color.pink,
    IMAGE: theme.color.yellow,
    PRESENTATION: theme.color.orange,
    SPREADSHEET: theme.color.turquoise,
    TEXT_DOCUMENT: theme.color.blue,
    VIDEO: theme.color.purple,
    OTHER: theme.color.gray,
  };

  if (isDefined(fileCategoryField?.options)) {
    fileCategoryField.options.forEach((option) => {
      const category = option.value as AttachmentFileCategory;
      const color = option.color as ThemeColor;
      if (
        isDefined(category) &&
        isDefined(color) &&
        isDefined(theme.color[color])
      ) {
        colorMap[category] = theme.color[color];
      }
    });
  }

  return colorMap;
};
