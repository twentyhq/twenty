import { type AttachmentType } from '@/activities/files/types/Attachment';
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

export const IconMapping: { [key in AttachmentType]: IconComponent } = {
  ARCHIVE: IconFileZip,
  AUDIO: IconHeadphones,
  IMAGE: IconPhoto,
  PRESENTATION: IconPresentation,
  SPREADSHEET: IconTable,
  TEXT_DOCUMENT: IconFileText,
  VIDEO: IconVideo,
  OTHER: IconFile,
};
