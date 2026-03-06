import { promises as fs } from 'fs';
import { join } from 'path';

// npm pack wraps contents in a package/ subdirectory
export const resolvePackageContentDir = async (
  extractDir: string,
): Promise<string> => {
  const packageSubdir = join(extractDir, 'package');

  try {
    const stat = await fs.stat(packageSubdir);

    if (stat.isDirectory()) {
      return packageSubdir;
    }
  } catch {
    // no package/ subdirectory — contents are at root
  }

  return extractDir;
};
