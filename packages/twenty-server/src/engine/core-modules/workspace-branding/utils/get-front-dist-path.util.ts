import { existsSync } from 'fs';
import { join } from 'path';

export const getFrontDistPath = (): string | null => {
  const candidatePaths = [
    join(process.cwd(), 'dist', 'front'),
    join(__dirname, '..', '..', '..', '..', 'front'),
    join(__dirname, '..', 'front'),
  ];

  for (const candidatePath of candidatePaths) {
    if (existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  return null;
};
