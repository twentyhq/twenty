import { readFileSync } from 'fs';
import { join } from 'path';

export const getAppVersion = (): string | null => {
  try {
    const packageJsonPath = join(__dirname, '../../../../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    return packageJson.version;
  } catch (error) {
    return null;
  }
};
