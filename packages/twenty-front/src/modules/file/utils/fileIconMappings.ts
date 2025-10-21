import { type AttachmentFileCategory } from '@/activities/files/types/AttachmentFileCategory';
import {
  type IconComponent,
  IconFile,
  IconFileText,
  IconFileZip,
  IconHeadphones,
  IconPhoto,
  IconPresentation,
  IconTable,
  IconVideo,
} from 'twenty-ui/display';

export const IconMapping: {
  [key in AttachmentFileCategory]: IconComponent;
} = {
  ARCHIVE: IconFileZip,
  AUDIO: IconHeadphones,
  IMAGE: IconPhoto,
  PRESENTATION: IconPresentation,
  SPREADSHEET: IconTable,
  TEXT_DOCUMENT: IconFileText,
  VIDEO: IconVideo,
  OTHER: IconFile,
};
