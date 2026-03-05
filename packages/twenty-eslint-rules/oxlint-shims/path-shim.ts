// Shim for Node.js `path` module.

export const sep = '/';

export const basename = (filePath: string): string => {
  const separatorIndex = filePath.lastIndexOf('/');

  return separatorIndex === -1 ? filePath : filePath.slice(separatorIndex + 1);
};
