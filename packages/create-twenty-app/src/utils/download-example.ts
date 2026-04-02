import { execSync } from 'node:child_process';
import * as fs from 'fs-extra';
import { join } from 'path';
import { tmpdir } from 'node:os';

const TWENTY_REPO_OWNER = 'twentyhq';
const TWENTY_REPO_NAME = 'twenty';
const TWENTY_DEFAULT_REF = 'main';
const TWENTY_EXAMPLES_PATH = 'packages/twenty-apps/examples';

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

export const downloadExample = async (
  source: string,
  targetDirectory: string,
): Promise<void> => {
  const { owner, repo, ref, path } = resolveSource(source);
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
      throw new Error(
        `Example not found: "${path}" does not exist in ${owner}/${repo} (ref: ${ref})`,
      );
    }

    const stat = await fs.stat(sourcePath);

    if (!stat.isDirectory()) {
      throw new Error(
        `Example path "${path}" is not a directory in ${owner}/${repo}`,
      );
    }

    await fs.copy(sourcePath, targetDirectory);
  } finally {
    await fs.remove(tempDir);
  }
};
