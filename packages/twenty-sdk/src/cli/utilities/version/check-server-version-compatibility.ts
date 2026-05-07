import { execSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import * as os from 'os';
import * as path from 'path';

import chalk from 'chalk';

import { ensureDir } from '@/cli/utilities/file/fs-utils';
import {
  CONTAINER_NAME,
  containerExists,
} from '@/cli/utilities/server/docker-container';

const CACHE_FILE = path.join(
  os.homedir(),
  '.twenty',
  'version-check-cache.json',
);
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 3000;
const DOCKER_HUB_TAGS_URL =
  'https://hub.docker.com/v2/repositories/twentycrm/twenty-app-dev/tags?page_size=100';

type CacheFile = { latestVersion: string; fetchedAt: number };

export const parseSemver = (raw: string): [number, number, number] | null => {
  const trimmed = raw.replace(/^v/, '').trim();
  const match = trimmed.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    return null;
  }

  return [
    parseInt(match[1], 10),
    parseInt(match[2], 10),
    parseInt(match[3], 10),
  ];
};

export const compareSemver = (
  a: [number, number, number],
  b: [number, number, number],
): number => {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] - b[1];

  return a[2] - b[2];
};

export const getLocalServerVersion = (
  containerName: string = CONTAINER_NAME,
): string | null => {
  if (!containerExists(containerName)) {
    return null;
  }

  try {
    const result = execSync(
      `docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' ${containerName}`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] },
    );

    const match = result.match(/^APP_VERSION=(.+)$/m);

    if (!match || match[1] === '0.0.0' || match[1] === '') {
      return null;
    }

    return match[1].trim();
  } catch {
    return null;
  }
};

const readCache = async (): Promise<CacheFile | null> => {
  try {
    const content = await readFile(CACHE_FILE, 'utf-8');
    const parsed = JSON.parse(content) as CacheFile;

    if (
      typeof parsed.latestVersion !== 'string' ||
      typeof parsed.fetchedAt !== 'number'
    ) {
      return null;
    }

    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const writeCache = async (latestVersion: string): Promise<void> => {
  try {
    await ensureDir(path.dirname(CACHE_FILE));
    await writeFile(
      CACHE_FILE,
      JSON.stringify({
        latestVersion,
        fetchedAt: Date.now(),
      } satisfies CacheFile),
    );
  } catch {
    // Cache write failures shouldn't break the CLI
  }
};

const fetchLatestFromDockerHub = async (): Promise<string | null> => {
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
      results?: Array<{ name?: unknown }>;
    };

    if (!Array.isArray(body.results)) {
      return null;
    }

    const versions = body.results
      .map((tag) => (typeof tag.name === 'string' ? tag.name : null))
      .filter((name): name is string => name !== null && name !== 'latest')
      .map((name) => ({ name, parsed: parseSemver(name) }))
      .filter(
        (entry): entry is { name: string; parsed: [number, number, number] } =>
          entry.parsed !== null,
      );

    if (versions.length === 0) {
      return null;
    }

    versions.sort((a, b) => compareSemver(b.parsed, a.parsed));

    return versions[0].name;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getLatestServerVersion = async (): Promise<string | null> => {
  const cached = await readCache();

  if (cached !== null) {
    return cached.latestVersion;
  }

  const fresh = await fetchLatestFromDockerHub();

  if (fresh !== null) {
    await writeCache(fresh);
  }

  return fresh;
};

export const checkServerVersionCompatibility = async (
  containerName: string = CONTAINER_NAME,
): Promise<void> => {
  const localVersion = getLocalServerVersion(containerName);

  if (localVersion === null) {
    return;
  }

  const latestVersion = await getLatestServerVersion();

  if (latestVersion === null) {
    return;
  }

  const localParsed = parseSemver(localVersion);
  const latestParsed = parseSemver(latestVersion);

  if (localParsed === null || latestParsed === null) {
    return;
  }

  if (compareSemver(localParsed, latestParsed) >= 0) {
    return;
  }

  console.warn(
    chalk.yellow(
      `⚠ Local Twenty server is v${localVersion}; latest available is v${latestVersion}.\n` +
        `  Some manifest features may not work on the older version.\n` +
        `  Update with: yarn twenty server upgrade`,
    ),
  );
  console.warn('');
};
