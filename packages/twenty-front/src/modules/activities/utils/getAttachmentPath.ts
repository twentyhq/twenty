export const getAttachmentPath = (attachmentFullPath: string) => {
  if (!attachmentFullPath.includes('/files/')) {
    return attachmentFullPath?.split('?')[0];
  }

  const base = attachmentFullPath?.split('/files/')[0];
  const rawPath = attachmentFullPath?.split('/files/')[1]?.split('?')[0];

  if (!rawPath) {
    throw new Error(`Invalid attachment path: ${attachmentFullPath}`);
  }

  if (!rawPath.startsWith('attachment/')) {
    return attachmentFullPath?.split('?')[0];
  }

  const pathParts = rawPath.split('/');
  if (pathParts.length < 2) {
    throw new Error(
      `Invalid attachment path structure: ${rawPath}. Path must have at least two segments.`,
    );
  }
  const filename = pathParts.pop();

  pathParts.pop();

  return `${base}/files/${pathParts.join('/')}/${filename}`;
};
