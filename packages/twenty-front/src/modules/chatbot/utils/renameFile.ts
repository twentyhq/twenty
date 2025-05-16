export const renameFile = (fileUrl: string) =>
  fileUrl ? fileUrl.split('/').pop()?.split('?')[0] : null;
