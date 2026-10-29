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

const createApp = async (appSystemPermissionFlag?: Record<string, string>) => {
  const appPath = await mkdtemp(join(tmpdir(), 'twenty-pull-flags-'));
  appPaths.push(appPath);
  await writeFile(join(appPath, 'package.json'), '{}');

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
    appSystemPermissionFlag === undefined
      ? ''
      : `exports.SystemPermissionFlag = ${JSON.stringify(appSystemPermissionFlag)};`,
  );

  return appPath;
};

const buildRoleFileContent = (appPath: string) =>
  writeDefineFile({
    definer: 'defineRole',
    config: {
      permissionFlagUniversalIdentifiers: [
        SystemPermissionFlag.CONNECTED_ACCOUNTS,
        SystemPermissionFlag.APPLICATIONS,
        SystemPermissionFlag.WORKFLOWS,
      ],
    },
    enumBindings: buildRoleEnumBindings(
      resolvePullSystemPermissionFlag(appPath),
    ),
  }).content;

describe('resolvePullSystemPermissionFlag', () => {
  it('writes the new names when the app SDK lists them first', async () => {
    const appPath = await createApp({
      USER_APPS: SystemPermissionFlag.CONNECTED_ACCOUNTS,
      WORKSPACE_APPS: SystemPermissionFlag.APPLICATIONS,
      ...SystemPermissionFlag,
    });

    const content = buildRoleFileContent(appPath);

    expect(content).toContain('SystemPermissionFlag.USER_APPS');
    expect(content).toContain('SystemPermissionFlag.WORKSPACE_APPS');
    expect(content).toContain('SystemPermissionFlag.WORKFLOWS');
    expect(content).not.toContain('SystemPermissionFlag.CONNECTED_ACCOUNTS');
    expect(content).not.toContain('SystemPermissionFlag.APPLICATIONS');
  });

  it('keeps the names of an older app SDK and writes flags it lacks as identifiers', async () => {
    const appPath = await createApp({
      CONNECTED_ACCOUNTS: SystemPermissionFlag.CONNECTED_ACCOUNTS,
      APPLICATIONS: SystemPermissionFlag.APPLICATIONS,
    });

    const content = buildRoleFileContent(appPath);

    expect(content).toContain('SystemPermissionFlag.CONNECTED_ACCOUNTS');
    expect(content).toContain('SystemPermissionFlag.APPLICATIONS');
    expect(content).toContain(`'${SystemPermissionFlag.WORKFLOWS}'`);
  });

  it('uses the shared flags when the app SDK does not export SystemPermissionFlag', async () => {
    expect(resolvePullSystemPermissionFlag(await createApp())).toBe(
      SystemPermissionFlag,
    );
  });
});
