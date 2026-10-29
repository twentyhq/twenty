import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';
import { SystemPermissionFlag } from 'twenty-shared/constants';

import { resolveAppSystemPermissionFlag } from '@/app/project/resolve-app-system-permission-flag';
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

const createApp = async (sdkDefineSource = '') => {
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
  await writeFile(join(sdkPath, 'define.cjs'), sdkDefineSource);

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
      resolveAppSystemPermissionFlag(appPath),
    ),
  }).content;

describe('resolveAppSystemPermissionFlag', () => {
  it('writes the new names an app SDK defines as non-enumerable aliases', async () => {
    const appPath = await createApp(
      `exports.SystemPermissionFlag = Object.assign(
        Object.defineProperties({}, {
          USER_APPS: { value: '${SystemPermissionFlag.CONNECTED_ACCOUNTS}' },
          WORKSPACE_APPS: { value: '${SystemPermissionFlag.APPLICATIONS}' },
        }),
        ${JSON.stringify(SystemPermissionFlag)},
      );`,
    );

    const content = buildRoleFileContent(appPath);

    expect(content).toContain('SystemPermissionFlag.USER_APPS');
    expect(content).toContain('SystemPermissionFlag.WORKSPACE_APPS');
    expect(content).toContain('SystemPermissionFlag.WORKFLOWS');
    expect(content).not.toContain('SystemPermissionFlag.CONNECTED_ACCOUNTS');
    expect(content).not.toContain('SystemPermissionFlag.APPLICATIONS');
  });

  it('keeps the names of an older app SDK and writes flags it lacks as identifiers', async () => {
    const appPath = await createApp(
      `exports.SystemPermissionFlag = ${JSON.stringify({
        CONNECTED_ACCOUNTS: SystemPermissionFlag.CONNECTED_ACCOUNTS,
        APPLICATIONS: SystemPermissionFlag.APPLICATIONS,
      })};`,
    );

    const content = buildRoleFileContent(appPath);

    expect(content).toContain('SystemPermissionFlag.CONNECTED_ACCOUNTS');
    expect(content).toContain('SystemPermissionFlag.APPLICATIONS');
    expect(content).toContain(`'${SystemPermissionFlag.WORKFLOWS}'`);
  });

  it('writes every flag as its identifier when the app SDK does not export SystemPermissionFlag', async () => {
    const appPath = await createApp();

    expect(resolveAppSystemPermissionFlag(appPath)).toEqual({});
    expect(buildRoleFileContent(appPath)).toContain(
      `'${SystemPermissionFlag.CONNECTED_ACCOUNTS}'`,
    );
  });
});
