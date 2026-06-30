import { type AttachmentFileCategory } from '@/activities/files/types/Attachment';

const FileExtensionMapping: {
  [key: string]: AttachmentFileCategory;
} = {
  doc: 'TEXT_DOCUMENT',
  docm: 'TEXT_DOCUMENT',
  docx: 'TEXT_DOCUMENT',
  dot: 'TEXT_DOCUMENT',
  dotx: 'TEXT_DOCUMENT',
  odt: 'TEXT_DOCUMENT',
  pdf: 'TEXT_DOCUMENT',
  txt: 'TEXT_DOCUMENT',
  rtf: 'TEXT_DOCUMENT',
  ps: 'TEXT_DOCUMENT',
  tex: 'TEXT_DOCUMENT',
  pages: 'TEXT_DOCUMENT',
  xls: 'SPREADSHEET',
  xlsb: 'SPREADSHEET',
  xlsm: 'SPREADSHEET',
  xlsx: 'SPREADSHEET',
  xltx: 'SPREADSHEET',
  csv: 'SPREADSHEET',
  tsv: 'SPREADSHEET',
  ods: 'SPREADSHEET',
  numbers: 'SPREADSHEET',
  ppt: 'PRESENTATION',
  pptx: 'PRESENTATION',
  potx: 'PRESENTATION',
  odp: 'PRESENTATION',
  html: 'PRESENTATION',
  key: 'PRESENTATION',
  kth: 'PRESENTATION',
  png: 'IMAGE',
  jpg: 'IMAGE',
  jpeg: 'IMAGE',
  svg: 'IMAGE',
  gif: 'IMAGE',
  webp: 'IMAGE',
  heif: 'IMAGE',
  tif: 'IMAGE',
  tiff: 'IMAGE',
  bmp: 'IMAGE',
  ico: 'IMAGE',
  mp4: 'VIDEO',
  avi: 'VIDEO',
  mov: 'VIDEO',
  wmv: 'VIDEO',
  mpg: 'VIDEO',
  mpeg: 'VIDEO',
  mp3: 'AUDIO',
  wav: 'AUDIO',
  ogg: 'AUDIO',
  wma: 'AUDIO',
  zip: 'ARCHIVE',
  tar: 'ARCHIVE',
  iso: 'ARCHIVE',
  gz: 'ARCHIVE',
  rar: 'ARCHIVE',
  '7z': 'ARCHIVE',
};

export const getFileType = (fileName: string): AttachmentFileCategory => {
  const fileExtension = fileName.split('.').at(-1);
  if (!fileExtension) {
    return 'OTHER';
  }
  return FileExtensionMapping[fileExtension.toLowerCase()] ?? 'OTHER';
};
