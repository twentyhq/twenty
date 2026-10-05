import { readdirSync, statSync } from 'node:fs';

import { isIgnoredWatchPath } from '@/app/dev/is-ignored-watch-path';

import { type WatchInput } from '@/app/dev/types/watch-inputs.type';

export const readWatchInputStamp = ({
  path,
  kind,
}: Pick<WatchInput, 'path' | 'kind'>): string | null => {
  try {
    if (kind === 'directory') {
      return JSON.stringify(
        readdirSync(path)
          .filter((entry) => !isIgnoredWatchPath(entry))
          .sort(),
      );
    }

    const stat = statSync(path, { bigint: true });

    return `${stat.ino}:${stat.size}:${stat.mtimeNs}:${stat.ctimeNs}`;
  } catch {
    return null;
  }
};
