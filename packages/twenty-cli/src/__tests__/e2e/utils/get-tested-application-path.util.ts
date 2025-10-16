import path from 'path';

export const getTestedApplicationPath = (relativePath: string): string => {
  const currentFileDir = __dirname;

  const twentyAppsPath = path.resolve(
    currentFileDir,
    '../../../../../twenty-apps',
  );

  return path.join(twentyAppsPath, relativePath);
};
