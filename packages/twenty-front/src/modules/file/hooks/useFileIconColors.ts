import { type AttachmentFileCategory } from '@/activities/files/types/AttachmentFileCategory';
import { type FileCategory } from 'twenty-shared/types';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

export const useFileIconColors = (): Record<
  AttachmentFileCategory | FileCategory,
  string
> => {
  return {
    ARCHIVE: resolveThemeVariable(themeCssVariables.color.gray),
    AUDIO: resolveThemeVariable(themeCssVariables.color.pink),
    IMAGE: resolveThemeVariable(themeCssVariables.color.amber),
    PRESENTATION: resolveThemeVariable(themeCssVariables.color.orange),
    SPREADSHEET: resolveThemeVariable(themeCssVariables.color.turquoise),
    TEXT_DOCUMENT: resolveThemeVariable(themeCssVariables.color.blue),
    VIDEO: resolveThemeVariable(themeCssVariables.color.purple),
    OTHER: resolveThemeVariable(themeCssVariables.color.gray),
  };
};
