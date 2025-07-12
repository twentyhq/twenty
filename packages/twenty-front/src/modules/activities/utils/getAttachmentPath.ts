export const getAttachmentPath = (attachmentFullPath: string) => {
  const rawPath = attachmentFullPath.split('/files/')[1]?.split('?')[0];

  if (!rawPath) {
    throw new Error(`Invalid attachment path: ${attachmentFullPath}`);
  }

  if (!rawPath.startsWith('attachment/')) {
    return rawPath;
  }

  const pathParts = rawPath.split('/');
  if (pathParts.length < 2) {
    throw new Error(
      `Invalid attachment path structure: ${rawPath}. Path must have at least two segments.`,
    );
  }
  const filename = pathParts.pop();

  pathParts.pop();

  return `${pathParts.join('/')}/${filename}`;
};
