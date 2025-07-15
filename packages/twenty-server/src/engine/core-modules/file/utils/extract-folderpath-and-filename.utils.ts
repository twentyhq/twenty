export function extractFolderPathAndFilename(fullPath: string): {
  folderPath: string;
  filename: string;
} {
  if (!fullPath || typeof fullPath !== 'string') {
    throw new Error('Invalid fullPath provided');
  }
  const parts = fullPath.split('/');
  const filename = parts.pop() || '';
  const folderPath = parts.join('/');

  return { folderPath, filename };
}
