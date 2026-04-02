import { execSync } from 'node:child_process';
import * as fs from 'fs-extra';
import { join } from 'path';
import { tmpdir } from 'node:os';

const TWENTY_REPO_OWNER = 'twentyhq';
const TWENTY_REPO_NAME = 'twenty';
const TWENTY_DEFAULT_REF = 'main';
const TWENTY_EXAMPLES_PATH = 'packages/twenty-apps/examples';
const TWENTY_EXAMPLES_URL = `https://github.com/${TWENTY_REPO_OWNER}/${TWENTY_REPO_NAME}/tree/${TWENTY_DEFAULT_REF}/${TWENTY_EXAMPLES_PATH}`;

type ResolvedGitHubSource = {
  owner: string;
  repo: string;
  ref: string;
  path: string;
};

export const isUrl = (source: string): boolean => {
  return source.startsWith('https://') || source.startsWith('http://');
};

export const parseGitHubUrl = (url: string): ResolvedGitHubSource => {
  const match = url.match(
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\/tree\/([^/]+)(?:\/(.+))?)?(?:\.git)?$/,
  );

  if (!match) {
    throw new Error(
      `Invalid GitHub URL: "${url}". Expected format: https://github.com/owner/repo[/tree/ref[/path]]`,
    );
  }

  const [, owner, repo, ref, path] = match;

  return {
    owner,
    repo,
    ref: ref ?? TWENTY_DEFAULT_REF,
    path: path ?? '',
  };
};

const resolveSource = (source: string): ResolvedGitHubSource => {
  if (isUrl(source)) {
    return parseGitHubUrl(source);
  }

  return {
    owner: TWENTY_REPO_OWNER,
    repo: TWENTY_REPO_NAME,
    ref: TWENTY_DEFAULT_REF,
    path: `${TWENTY_EXAMPLES_PATH}/${source}`,
  };
};

// Uses the GitHub Contents API to list directories — fast and doesn't download the repo
const fetchGitHubDirectoryContents = async (
  owner: string,
  repo: string,
  path: string,
  ref: string,
): Promise<{ name: string; type: string }[] | null> => {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;

  const response = await fetch(apiUrl, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    return null;
  }

  return data as { name: string; type: string }[];
};

const listAvailableExamples = async (
  owner: string,
  repo: string,
  ref: string,
): Promise<string[]> => {
  const contents = await fetchGitHubDirectoryContents(
    owner,
    repo,
    TWENTY_EXAMPLES_PATH,
    ref,
  );

  if (!contents) {
    return [];
  }

  return contents
    .filter((entry) => entry.type === 'dir')
    .map((entry) => entry.name);
};

const validateExampleExists = async (
  source: ResolvedGitHubSource,
  originalSource: string,
): Promise<void> => {
  const { owner, repo, ref, path } = source;

  const contents = await fetchGitHubDirectoryContents(owner, repo, path, ref);

  if (contents !== null) {
    return;
  }

  if (!isUrl(originalSource)) {
    const availableExamples = await listAvailableExamples(owner, repo, ref);

    throw new Error(
      `Example "${originalSource}" not found.\n\n` +
        (availableExamples.length > 0
          ? `Available examples:\n${availableExamples.map((name) => `  - ${name}`).join('\n')}\n\n`
          : '') +
        `Browse all examples: ${TWENTY_EXAMPLES_URL}`,
    );
  }

  throw new Error(
    `Example not found: "${path}" does not exist in ${owner}/${repo} (ref: ${ref})`,
  );
};

export const downloadExample = async (
  source: string,
  targetDirectory: string,
): Promise<void> => {
  const resolved = resolveSource(source);
  const { owner, repo, ref, path } = resolved;

  // Validate the example exists before downloading (fast API call)
  await validateExampleExists(resolved, source);

  const tarballUrl = `https://codeload.github.com/${owner}/${repo}/tar.gz/${ref}`;

  const tempDir = join(
    tmpdir(),
    `create-twenty-app-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  try {
    await fs.ensureDir(tempDir);

    const response = await fetch(tarballUrl);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `Could not find repository: ${owner}/${repo} (ref: ${ref})`,
        );
      }
      throw new Error(
        `Failed to download from GitHub: ${response.status} ${response.statusText}`,
      );
    }

    const tarballPath = join(tempDir, 'archive.tar.gz');

    const buffer = Buffer.from(await response.arrayBuffer());

    await fs.writeFile(tarballPath, buffer);

    execSync(`tar xzf "${tarballPath}" -C "${tempDir}"`, {
      stdio: 'pipe',
    });

    // GitHub tarballs extract to a directory named {repo}-{ref}/
    const extractedEntries = await fs.readdir(tempDir);
    const extractedDir = extractedEntries.find(
      (entry) => entry !== 'archive.tar.gz',
    );

    if (!extractedDir) {
      throw new Error('Failed to extract archive: no directory found');
    }

    const sourcePath = path
      ? join(tempDir, extractedDir, path)
      : join(tempDir, extractedDir);

    if (!(await fs.pathExists(sourcePath))) {
      throw new Error(`Example directory not found in archive: "${path}"`);
    }

    await fs.copy(sourcePath, targetDirectory);
  } finally {
    await fs.remove(tempDir);
  }
};
