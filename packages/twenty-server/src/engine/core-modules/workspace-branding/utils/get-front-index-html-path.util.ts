import { existsSync } from 'fs';
import { join } from 'path';

export const getFrontIndexHtmlPath = (): string | null => {
  const candidatePaths = [
    join(__dirname, '..', '..', '..', 'front', 'index.html'),
    join(__dirname, '..', '..', '..', '..', 'front', 'index.html'),
  ];

  for (const candidatePath of candidatePaths) {
    if (existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  return null;
};
