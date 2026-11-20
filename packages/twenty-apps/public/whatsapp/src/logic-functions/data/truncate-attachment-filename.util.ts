const ATTACHMENT_FILENAME_MAX_LENGTH = 255;

export const truncateAttachmentFilename = (fileName: string): string => {
  if (fileName.length <= ATTACHMENT_FILENAME_MAX_LENGTH) {
    return fileName;
  }

  const extensionIndex = fileName.lastIndexOf('.');
  const extension =
    extensionIndex > 0 && fileName.length - extensionIndex <= 16 ? fileName.slice(extensionIndex) : '';

  return fileName.slice(0, ATTACHMENT_FILENAME_MAX_LENGTH - extension.length) + extension;
};
