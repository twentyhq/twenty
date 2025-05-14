export const getAttachmentPath = (attachmentFullPath: string) => {
  return attachmentFullPath.split('/files/')[1].split('?')[0];
};
