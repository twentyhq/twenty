import { readdirSync, statSync } from 'node:fs';

import { isIgnoredWatchPath } from '@/app/dev/is-ignored-watch-path';
import { isBroadWatchDirectory } from '@/app/dev/is-broad-watch-directory';

import { type WatchInput } from '@/app/dev/types/watch-inputs.type';

export const readWatchInputStamp = ({
  path,
  kind,
}: Pick<WatchInput, 'path' | 'kind'>): string | null => {
  try {
    if (kind === 'directory') {
      if (isBroadWatchDirectory(path)) {
        return null;
      }

      const stat = statSync(path, { bigint: true });

      return JSON.stringify([
        stat.dev.toString(),
        stat.ino.toString(),
        readdirSync(path, { withFileTypes: true })
          .filter((entry) => !isIgnoredWatchPath(entry.name))
          .map((entry) => [
            entry.name,
            entry.isDirectory(),
            entry.isFile(),
            entry.isSymbolicLink(),
          ])
          .sort(([first], [second]) =>
            String(first).localeCompare(String(second)),
          ),
      ]);
    }

    const stat = statSync(path, { bigint: true });

    return `${stat.ino}:${stat.size}:${stat.mtimeNs}:${stat.ctimeNs}`;
  } catch {
    return null;
  }
};
