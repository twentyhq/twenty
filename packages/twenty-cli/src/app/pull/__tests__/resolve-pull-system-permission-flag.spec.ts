import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';
import { SystemPermissionFlag } from 'twenty-shared/constants';

import { resolvePullSystemPermissionFlag } from '@/app/pull/resolve-pull-system-permission-flag';
import {
  buildRoleEnumBindings,
  writeDefineFile,
} from '@/app/pull/write-define-file';

const appPaths: string[] = [];

afterEach(async () => {
  await Promise.all(
    appPaths
      .splice(0)
      .map((appPath) => rm(appPath, { recursive: true, force: true })),
  );
});

const createApp = async () => {
  const appPath = await mkdtemp(join(tmpdir(), 'twenty-pull-flags-'));
  appPaths.push(appPath);
  await writeFile(join(appPath, 'package.json'), '{}');

  return appPath;
};

describe('resolvePullSystemPermissionFlag', () => {
  it('names flags as the app SDK does and writes the ones it lacks as identifiers', async () => {
    const appPath = await createApp();
    const sdkPath = join(appPath, 'node_modules/twenty-sdk');
    await mkdir(sdkPath, { recursive: true });
    await writeFile(
      join(sdkPath, 'package.json'),
      JSON.stringify({
        name: 'twenty-sdk',
        exports: { './define': './define.cjs' },
      }),
    );
    await writeFile(
      join(sdkPath, 'define.cjs'),
      `exports.SystemPermissionFlag = ${JSON.stringify({
        CONNECTED_ACCOUNTS: SystemPermissionFlag.USER_APPS,
        APPLICATIONS: SystemPermissionFlag.WORKSPACE_APPS,
      })};`,
    );

    const { content } = writeDefineFile({
      definer: 'defineRole',
      config: {
        permissionFlagUniversalIdentifiers: [
          SystemPermissionFlag.USER_APPS,
          SystemPermissionFlag.WORKSPACE_APPS,
          SystemPermissionFlag.WORKFLOWS,
        ],
      },
      enumBindings: buildRoleEnumBindings(
        resolvePullSystemPermissionFlag(appPath),
      ),
    });

    expect(content).toContain('SystemPermissionFlag.CONNECTED_ACCOUNTS');
    expect(content).toContain('SystemPermissionFlag.APPLICATIONS');
    expect(content).toContain(`'${SystemPermissionFlag.WORKFLOWS}'`);
  });

  it('falls back to the shared flags when the app SDK cannot be loaded', async () => {
    expect(resolvePullSystemPermissionFlag(await createApp())).toBe(
      SystemPermissionFlag,
    );
  });
});
