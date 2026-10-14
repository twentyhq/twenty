import { isArray, isNonEmptyString } from '@sniptt/guards';
import { mkdtemp, rm } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { isPlainObject } from 'twenty-shared/utils';

import { readSnapshotFile } from '@/app/deployment/read-snapshot-file';
import { resolveSnapshotDirectory } from '@/app/deployment/resolve-snapshot-directory';
import { runNpmCommand } from '@/app/publish/run-npm-command';
import { type ToolingBuild } from '@/app/types/tooling-result.type';
import { CliError } from '@/output/cli-error';
import { type Output } from '@/output/types/output.type';

export type PackedApp = {
  path: string;
  name: string;
  version: string;
};

export const withPackedApp = async <TResult>({
  appPath,
  build,
  signal,
  output,
  usePackage,
}: {
  appPath: string;
  build: ToolingBuild;
  signal: AbortSignal;
  output: Output;
  usePackage: (packedApp: PackedApp) => Promise<TResult>;
}): Promise<TResult> => {
  const snapshotDirectory = resolveSnapshotDirectory({ build, appPath });

  for (const artifact of build.files) {
    signal.throwIfAborted();
    await readSnapshotFile({ snapshotDirectory, artifact });
  }

  const packageDirectory = await mkdtemp(
    join(dirname(snapshotDirectory), 'package-'),
  );

  try {
    output.progress('Packing the built app…');
    const stdout = await runNpmCommand({
      args: [
        'pack',
        snapshotDirectory,
        '--json',
        '--ignore-scripts',
        '--workspaces=false',
        '--pack-destination',
        packageDirectory,
      ],
      appPath,
      signal,
    });
    let result: unknown;

    try {
      result = JSON.parse(stdout);
    } catch {
      throw new CliError({
        code: 'PUBLISH_FAILED',
        message: 'npm pack did not return a package description.',
      });
    }

    const packed =
      isArray(result) && result.length === 1 ? result[0] : undefined;

    if (
      !isPlainObject(packed) ||
      !isNonEmptyString(packed.name) ||
      !isNonEmptyString(packed.version) ||
      !isNonEmptyString(packed.filename) ||
      basename(packed.filename) !== packed.filename ||
      packed.filename.includes('\\') ||
      !packed.filename.endsWith('.tgz') ||
      !isArray(packed.files)
    ) {
      throw new CliError({
        code: 'PUBLISH_FAILED',
        message: 'npm pack returned an invalid package description.',
      });
    }

    const includedPaths = new Set(
      packed.files.filter(isPlainObject).map((file) => file.path),
    );
    const requiredPaths = [
      'manifest.json',
      'package.json',
      ...build.files
        .map((file) => file.path)
        .filter((path) => path !== 'yarn.lock'),
    ];
    const missingPaths = [...new Set(requiredPaths)].filter(
      (path) => !includedPaths.has(path),
    );

    if (missingPaths.length > 0) {
      throw new CliError({
        code: 'PUBLISH_FAILED',
        message: 'The npm package is missing files required by the built app.',
        hint: 'Update the files field in package.json to include the manifest and built files.',
        details: { missingPaths },
      });
    }

    signal.throwIfAborted();

    return await usePackage({
      path: join(packageDirectory, packed.filename),
      name: packed.name,
      version: packed.version,
    });
  } finally {
    await rm(packageDirectory, { recursive: true, force: true }).catch(() => {
      output.warn({
        code: 'PACKAGE_CLEANUP_FAILED',
        message: `Could not remove temporary package folder ${packageDirectory}.`,
      });
    });
  }
};
