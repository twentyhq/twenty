import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { basename } from 'node:path';

const git = (...arguments_) =>
  execFileSync('git', arguments_, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

const hasRelevantChanges = () => {
  if (process.env.ANY_CHANGED !== 'true') {
    return false;
  }

  try {
    const changedFiles = JSON.parse(process.env.CHANGED_FILES);
    const modifiedFiles = new Set(JSON.parse(process.env.MODIFIED_FILES));

    if (
      changedFiles.length === 0 ||
      changedFiles.some(
        (file) => basename(file) !== 'package.json' || !modifiedFiles.has(file),
      )
    ) {
      return true;
    }

    const headSha = process.env.HEAD_SHA;
    const baseSha =
      process.env.IS_PULL_REQUEST === 'true'
        ? git('merge-base', process.env.BASE_SHA, headSha)
        : process.env.BASE_SHA;

    if (!baseSha || !headSha) {
      return true;
    }

    return changedFiles.some((file) => {
      const previousEntry = git('ls-tree', baseSha, '--', file);
      const currentEntry = git('ls-tree', headSha, '--', file);

      if (
        !previousEntry.startsWith('100644 blob ') ||
        !currentEntry.startsWith('100644 blob ')
      ) {
        return true;
      }

      const { version: previousVersion, ...previousManifest } = JSON.parse(
        git('show', `${baseSha}:${file}`),
      );
      const { version: currentVersion, ...currentManifest } = JSON.parse(
        git('show', `${headSha}:${file}`),
      );

      return (
        typeof previousVersion !== 'string' ||
        typeof currentVersion !== 'string' ||
        previousVersion.length === 0 ||
        currentVersion.length === 0 ||
        previousVersion === currentVersion ||
        JSON.stringify(previousManifest) !== JSON.stringify(currentManifest)
      );
    });
  } catch {
    console.warn('Could not verify version-only changes, keeping CI enabled.');

    return true;
  }
};

appendFileSync(
  process.env.GITHUB_OUTPUT,
  `any_changed=${hasRelevantChanges()}\n`,
);
