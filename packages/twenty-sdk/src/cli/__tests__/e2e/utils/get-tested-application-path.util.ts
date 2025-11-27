import path from 'path';

export const getTestedApplicationPath = (relativePath: string): string => {
  const twentyAppsPath = path.resolve(
    __dirname,
    '../../../../../../twenty-apps',
  );

  return path.join(twentyAppsPath, relativePath);
};
