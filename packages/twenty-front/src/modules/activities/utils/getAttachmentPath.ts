export const getAttachmentPath = (attachmentFullPath: string) => {
  const rawPath = attachmentFullPath.split('/files/')[1]?.split('?')[0];

  if (!rawPath) {
    throw new Error(`Invalid attachment path: ${attachmentFullPath}`);
  }

  if (!rawPath.startsWith('attachment/')) {
    return rawPath;
  }

  const pathParts = rawPath.split('/');
  const filename = pathParts.pop();

  pathParts.pop();

  return `${pathParts.join('/')}/${filename}`;
};
