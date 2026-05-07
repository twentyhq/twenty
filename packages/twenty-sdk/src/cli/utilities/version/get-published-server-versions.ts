import { readFile, writeFile } from 'node:fs/promises';
import * as os from 'os';
import * as path from 'path';

import { ensureDir } from '@/cli/utilities/file/fs-utils';
import { compareSemver } from '@/cli/utilities/version/compare-semver';
import { parseSemver } from '@/cli/utilities/version/parse-semver';
import { type PublishedServerVersion } from '@/cli/utilities/version/published-server-version';

const CACHE_FILE = path.join(
  os.homedir(),
  '.twenty',
  'version-check-cache.json',
);
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 3000;
const DOCKER_HUB_TAGS_URL =
  'https://hub.docker.com/v2/repositories/twentycrm/twenty-app-dev/tags?page_size=100';

type CacheFile = {
  fetchedAt: number;
  versions: Array<{ name: string; lastUpdatedAt: string }>;
};

const readCache = async (): Promise<PublishedServerVersion[] | null> => {
  try {
    const content = await readFile(CACHE_FILE, 'utf-8');
    const parsed = JSON.parse(content) as CacheFile;

    if (
      typeof parsed.fetchedAt !== 'number' ||
      !Array.isArray(parsed.versions)
    ) {
      return null;
    }

    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) {
      return null;
    }

    return parsed.versions.map((entry) => ({
      name: entry.name,
      lastUpdatedAt: new Date(entry.lastUpdatedAt),
    }));
  } catch {
    return null;
  }
};

const writeCache = async (
  versions: PublishedServerVersion[],
): Promise<void> => {
  try {
    await ensureDir(path.dirname(CACHE_FILE));
    await writeFile(
      CACHE_FILE,
      JSON.stringify({
        fetchedAt: Date.now(),
        versions: versions.map(({ name, lastUpdatedAt }) => ({
          name,
          lastUpdatedAt: lastUpdatedAt.toISOString(),
        })),
      } satisfies CacheFile),
    );
  } catch {
    // Cache write failures shouldn't break the CLI
  }
};

const fetchFromDockerHub = async (): Promise<
  PublishedServerVersion[] | null
> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(DOCKER_HUB_TAGS_URL, {
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as {
      results?: Array<{ name?: unknown; last_updated?: unknown }>;
    };

    if (!Array.isArray(body.results)) {
      return null;
    }

    const versions: PublishedServerVersion[] = [];

    for (const tag of body.results) {
      if (
        typeof tag.name !== 'string' ||
        typeof tag.last_updated !== 'string' ||
        tag.name === 'latest' ||
        parseSemver(tag.name) === null
      ) {
        continue;
      }

      const lastUpdatedAt = new Date(tag.last_updated);

      if (Number.isNaN(lastUpdatedAt.getTime())) {
        continue;
      }

      versions.push({
        name: tag.name.replace(/^v/, ''),
        lastUpdatedAt,
      });
    }

    versions.sort((a, b) => {
      const aParsed = parseSemver(a.name);
      const bParsed = parseSemver(b.name);

      if (aParsed === null || bParsed === null) {
        return 0;
      }

      return compareSemver(bParsed, aParsed);
    });

    return versions;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getPublishedServerVersions = async (): Promise<
  PublishedServerVersion[]
> => {
  const cached = await readCache();

  if (cached !== null) {
    return cached;
  }

  const fresh = await fetchFromDockerHub();

  if (fresh === null) {
    return [];
  }

  await writeCache(fresh);

  return fresh;
};
