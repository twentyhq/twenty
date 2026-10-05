import { isDefined } from 'twenty-shared/utils';

import { isInsideDirectory } from '@/utils/is-inside-directory';

const tryResolve = (
  resolveFromApp: NodeJS.RequireResolve,
  specifier: string,
) => {
  try {
    return resolveFromApp(specifier);
  } catch {
    return undefined;
  }
};

export const resolveInsideSdk = ({
  resolveFromApp,
  specifier,
  sdkPath,
}: {
  resolveFromApp: NodeJS.RequireResolve;
  specifier: string;
  sdkPath: string;
}) => {
  const resolvedPath = tryResolve(resolveFromApp, specifier);

  return isDefined(resolvedPath) &&
    isInsideDirectory({ filePath: resolvedPath, directory: sdkPath })
    ? resolvedPath
    : undefined;
};
