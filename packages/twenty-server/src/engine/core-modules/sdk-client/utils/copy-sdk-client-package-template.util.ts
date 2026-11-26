import { promises as fs } from 'fs';
import path from 'path';

import { SDK_CLIENT_PACKAGE_DIRNAME } from 'src/engine/core-modules/sdk-client/constants/sdk-client-package-dirname';

// Like an npm publish: the package without its sources and dependencies.
export const isSdkClientPackageTemplatePath = (sourcePath: string): boolean => {
  const relativePath = path.relative(SDK_CLIENT_PACKAGE_DIRNAME, sourcePath);

  return (
    !relativePath.includes('node_modules') && !relativePath.startsWith('src')
  );
};

export const copySdkClientPackageTemplate = (destination: string) =>
  fs.cp(SDK_CLIENT_PACKAGE_DIRNAME, destination, {
    recursive: true,
    filter: isSdkClientPackageTemplatePath,
  });
