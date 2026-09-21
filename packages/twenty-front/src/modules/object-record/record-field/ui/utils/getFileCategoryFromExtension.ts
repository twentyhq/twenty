import { FILE_CATEGORIES, type FileCategory } from 'twenty-shared/types';

export const getFileCategoryFromExtension = (
  extension?: string,
): FileCategory => {
  if (!extension) {
    return FILE_CATEGORIES.OTHER;
  }

  const ext = extension.toLowerCase().replace('.', '');

  if (
    ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'].includes(ext)
  ) {
    return FILE_CATEGORIES.IMAGE;
  }

  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v'].includes(ext)) {
    return FILE_CATEGORIES.VIDEO;
  }

  if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'wma', 'aac'].includes(ext)) {
    return FILE_CATEGORIES.AUDIO;
  }

  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) {
    return FILE_CATEGORIES.ARCHIVE;
  }

  if (['xls', 'xlsx', 'csv', 'ods', 'numbers'].includes(ext)) {
    return FILE_CATEGORIES.SPREADSHEET;
  }

  if (['ppt', 'pptx', 'odp', 'key'].includes(ext)) {
    return FILE_CATEGORIES.PRESENTATION;
  }

  if (['doc', 'docx', 'txt', 'rtf', 'odt', 'pdf', 'md'].includes(ext)) {
    return FILE_CATEGORIES.TEXT_DOCUMENT;
  }

  return FILE_CATEGORIES.OTHER;
};
