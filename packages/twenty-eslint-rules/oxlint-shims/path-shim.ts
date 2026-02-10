// Shim for Node.js `path` module (used by micromatch via eslint-plugin-lingui).

export const sep = '/';

export const basename = (filePath: string): string => {
  const separatorIndex = filePath.lastIndexOf('/');

  return separatorIndex === -1 ? filePath : filePath.slice(separatorIndex + 1);
};
