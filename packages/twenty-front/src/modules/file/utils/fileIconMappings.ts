import { AttachmentType } from '@/activities/files/types/Attachment';
import { useTheme } from '@emotion/react';
import {
  IconComponent,
  IconFile,
  IconFileText,
  IconFileZip,
  IconHeadphones,
  IconPhoto,
  IconPresentation,
  IconTable,
  IconVideo,
} from 'twenty-ui/display';

export const IconMapping: { [key in AttachmentType]: IconComponent } = {
  Archive: IconFileZip,
  Audio: IconHeadphones,
  Image: IconPhoto,
  Presentation: IconPresentation,
  Spreadsheet: IconTable,
  TextDocument: IconFileText,
  Video: IconVideo,
  Other: IconFile,
};

const getIconColors = (theme: any): { [key in AttachmentType]: string } => ({
  Archive: theme.color.gray,
  Audio: theme.color.pink,
  Image: theme.color.yellow,
  Presentation: theme.color.orange,
  Spreadsheet: theme.color.turquoise,
  TextDocument: theme.color.blue,
  Video: theme.color.purple,
  Other: theme.color.gray,
});

export const useFileTypeColors = () => {
  const theme = useTheme();
  return getIconColors(theme);
};
