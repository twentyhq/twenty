import { AttachmentType } from '@/activities/files/types/Attachment';

const FileExtensionMapping: { [key: string]: AttachmentType } = {
  doc: 'TextDocument',
  docm: 'TextDocument',
  docx: 'TextDocument',
  dot: 'TextDocument',
  dotx: 'TextDocument',
  odt: 'TextDocument',
  pdf: 'TextDocument',
  txt: 'TextDocument',
  rtf: 'TextDocument',
  xls: 'Spreadsheet',
  xlsb: 'Spreadsheet',
  xlsm: 'Spreadsheet',
  xlsx: 'Spreadsheet',
  xltx: 'Spreadsheet',
  csv: 'Spreadsheet',
  tsv: 'Spreadsheet',
  ods: 'Spreadsheet',
  ppt: 'Presentation',
  pptx: 'Presentation',
  potx: 'Presentation',
  odp: 'Presentation',
  html: 'Presentation',
  png: 'Image',
  jpg: 'Image',
  jpeg: 'Image',
  svg: 'Image',
  gif: 'Image',
  webp: 'Image',
  heif: 'Image',
  tif: 'Image',
  tiff: 'Image',
  bmp: 'Image',
  mp4: 'Video',
  avi: 'Video',
  mov: 'Video',
  wmv: 'Video',
  mpg: 'Video',
  mpeg: 'Video',
  mp3: 'Audio',
  zip: 'Archive',
  tar: 'Archive',
  iso: 'Archive',
  gz: 'Archive',
};

export const getFileType = (fileName: string): AttachmentType => {
  const fileExtension = fileName.split('.').at(-1);
  if (!fileExtension) {
    return 'Other';
  }
  return FileExtensionMapping[fileExtension.toLowerCase()] ?? 'Other';
};
