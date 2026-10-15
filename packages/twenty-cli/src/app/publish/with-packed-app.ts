import { mkdtemp, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { readSnapshotFile } from '@/app/deployment/read-snapshot-file';
import { resolveSnapshotDirectory } from '@/app/deployment/resolve-snapshot-directory';
import { parseNpmPackOutputOrThrow } from '@/app/publish/parse-npm-pack-output-or-throw';
import { runNpmCommand } from '@/app/publish/run-npm-command';
import { type PackedApp } from '@/app/publish/types/packed-app.type';
import { type ToolingBuild } from '@/app/types/tooling-result.type';
import { CliError } from '@/output/cli-error';
import { type Output } from '@/output/types/output.type';

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
    output.progress({ message: 'Packing the built app…' });
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
    const packed = parseNpmPackOutputOrThrow(stdout);
    const includedPaths = new Set(packed.files.map((file) => file.path));
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
