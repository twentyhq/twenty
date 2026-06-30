import { promises as fs } from 'fs';

export const pathExists = async (targetPath: string): Promise<boolean> => {
  try {
    await fs.access(targetPath);

    return true;
  } catch {
    return false;
  }
};
