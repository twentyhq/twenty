import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';
import { SystemPermissionFlag } from 'twenty-shared/constants';

import { LEGACY_SYSTEM_PERMISSION_FLAG } from '@/app/pull/legacy-system-permission-flag.constant';
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

const createAppWithSdkPermissionFlagNames = async (
  permissionFlagNames: string[],
) => {
  const appPath = await mkdtemp(join(tmpdir(), 'twenty-pull-flags-'));
  appPaths.push(appPath);
  const sdkPath = join(appPath, 'node_modules/twenty-sdk');
  await mkdir(sdkPath, { recursive: true });
  await writeFile(join(appPath, 'package.json'), '{}');
  await writeFile(
    join(sdkPath, 'package.json'),
    JSON.stringify({
      name: 'twenty-sdk',
      exports: { './define': './define.cjs' },
    }),
  );
  await writeFile(
    join(sdkPath, 'define.cjs'),
    `exports.SystemPermissionFlag = ${JSON.stringify(
      Object.fromEntries(permissionFlagNames.map((name) => [name, name])),
    )};`,
  );

  return appPath;
};

const writePulledRole = (appPath: string) =>
  writeDefineFile({
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
  }).content;

describe('permission flag names in pulled roles', () => {
  it('uses the current names when the app SDK exports them', async () => {
    const content = writePulledRole(
      await createAppWithSdkPermissionFlagNames([
        'USER_APPS',
        'WORKSPACE_APPS',
        'CONNECTED_ACCOUNTS',
        'APPLICATIONS',
      ]),
    );

    expect(content).toContain('SystemPermissionFlag.USER_APPS');
    expect(content).toContain('SystemPermissionFlag.WORKSPACE_APPS');
    expect(content).toContain('SystemPermissionFlag.WORKFLOWS');
    expect(content).not.toContain('CONNECTED_ACCOUNTS');
    expect(content).not.toContain('APPLICATIONS');
  });

  it('uses the former names when the app SDK predates the rename', async () => {
    const content = writePulledRole(
      await createAppWithSdkPermissionFlagNames([
        'CONNECTED_ACCOUNTS',
        'APPLICATIONS',
      ]),
    );

    expect(content).toContain('SystemPermissionFlag.CONNECTED_ACCOUNTS');
    expect(content).toContain('SystemPermissionFlag.APPLICATIONS');
    expect(content).toContain('SystemPermissionFlag.WORKFLOWS');
    expect(content).not.toContain('USER_APPS');
    expect(content).not.toContain('WORKSPACE_APPS');
  });

  it('names every system permission flag once in the former names', () => {
    expect(Object.values(LEGACY_SYSTEM_PERMISSION_FLAG).sort()).toEqual(
      Object.values(SystemPermissionFlag).sort(),
    );
  });
});
