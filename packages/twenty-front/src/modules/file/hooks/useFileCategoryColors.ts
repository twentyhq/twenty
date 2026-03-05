import { type AttachmentFileCategory } from '@/activities/files/types/AttachmentFileCategory';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type ThemeColor,
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
export const useFileCategoryColors = (): Record<
  AttachmentFileCategory,
  string
> => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const fileCategoryField = objectMetadataItem.fields.find(
    (field) => field.name === 'fileCategory',
  );

  const colorMap: Record<AttachmentFileCategory, string> = {
    ARCHIVE: resolveThemeVariable(themeCssVariables.color.gray),
    AUDIO: resolveThemeVariable(themeCssVariables.color.pink),
    IMAGE: resolveThemeVariable(themeCssVariables.color.yellow),
    PRESENTATION: resolveThemeVariable(themeCssVariables.color.orange),
    SPREADSHEET: resolveThemeVariable(themeCssVariables.color.turquoise),
    TEXT_DOCUMENT: resolveThemeVariable(themeCssVariables.color.blue),
    VIDEO: resolveThemeVariable(themeCssVariables.color.purple),
    OTHER: resolveThemeVariable(themeCssVariables.color.gray),
  };

  if (isDefined(fileCategoryField?.options)) {
    fileCategoryField.options.forEach((option) => {
      const category = option.value as AttachmentFileCategory;
      const color = option.color as ThemeColor;
      if (
        isDefined(category) &&
        isDefined(color) &&
        isDefined(
          (themeCssVariables.color as unknown as Record<string, string>)[color],
        )
      ) {
        colorMap[category] = resolveThemeVariable(
          (themeCssVariables.color as unknown as Record<string, string>)[color],
        );
      }
    });
  }

  return colorMap;
};
