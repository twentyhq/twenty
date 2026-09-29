import fs from 'fs';
import path from 'path';

export const walkMdxFiles = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walkMdxFiles(entryPath);
    }

    return entry.name.endsWith('.mdx') ? [entryPath] : [];
  });
