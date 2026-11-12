import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { isPlainObject } from 'twenty-shared/utils';
import { isString } from '@sniptt/guards';

import { isValidPackageName } from '@/app/is-valid-package-name';
import { listAncestorDirectories } from '@/app/project/list-ancestor-directories';
import { isInsideDirectory } from '@/utils/is-inside-directory';

export const isInstalledApplicationDependency = ({
  appPath,
  filePath,
}: {
  appPath: string;
  filePath: string;
}): boolean => {
  if (filePath.split(sep).includes('node_modules')) return true;
  if (isInsideDirectory({ directory: appPath, filePath })) return false;

  for (const directory of listAncestorDirectories(dirname(filePath))) {
    const packagePath = join(directory, 'package.json');
    if (!existsSync(packagePath)) continue;
    const packageJson: unknown = JSON.parse(readFileSync(packagePath, 'utf8'));
    if (
      !isPlainObject(packageJson) ||
      !isString(packageJson.name) ||
      !isValidPackageName(packageJson.name)
    )
      return false;
    const packageName = packageJson.name;
    return listAncestorDirectories(appPath).some((ancestor) => {
      const installedPath = join(ancestor, 'node_modules', packageName);
      return (
        existsSync(installedPath) && realpathSync(installedPath) === directory
      );
    });
  }
  return false;
};
