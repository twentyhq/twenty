import path from 'path';

export const getTestedApplicationPath = (relativePath: string): string => {
  const twentyAppsPath = path.resolve(__dirname, '..');

  return path.join(twentyAppsPath, relativePath);
};
