import path from 'path';

export const getTestedApplicationPath = (appName: string): string => {
  const appsPath = path.resolve(__dirname, '../../apps');

  return path.join(appsPath, appName);
};
