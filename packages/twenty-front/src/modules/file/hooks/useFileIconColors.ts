import { type AttachmentFileCategory } from '@/activities/files/types/AttachmentFileCategory';
import { useContext } from 'react';
import { type FileCategory } from 'twenty-shared/types';
import { ThemeContext } from 'twenty-ui/theme-constants';

export const useFileIconColors = (): Record<
  AttachmentFileCategory | FileCategory,
  string
> => {
  const { theme } = useContext(ThemeContext);

  return {
    ARCHIVE: theme.color.gray,
    AUDIO: theme.color.pink,
    IMAGE: theme.color.amber,
    PRESENTATION: theme.color.orange,
    SPREADSHEET: theme.color.turquoise,
    TEXT_DOCUMENT: theme.color.blue,
    VIDEO: theme.color.purple,
    OTHER: theme.color.gray,
  };
};
