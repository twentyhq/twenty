import {
  mkdir,
  mkdtemp,
  open,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises';
import type * as fileSystemPromises from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { type Manifest } from 'twenty-shared/application';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PULL_BASE_FILE_PATH } from '@/app/constants/pull-base-file-path.constant';
import { readTargetBoundPullBase } from '@/app/pull/read-target-bound-pull-base';
import { writePullBase } from '@/app/pull/write-pull-base';

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof fileSystemPromises>();

  return { ...actual, open: vi.fn(actual.open), rename: vi.fn(actual.rename) };
});

const TARGET = {
  apiUrl: 'https://crm.example.test/api',
  workspaceId: '48eb6ca1-dbd6-492e-8b53-5785a266c454',
};
const MANIFEST: Manifest = {
  application: {
    universalIdentifier: '6a0c9d8e-8f5f-4c43-9b8e-0e1f2a3b4c5d',
    displayName: 'App',
    description: '',
    defaultRoleUniversalIdentifier: 'c8c1213a-e037-41e6-bd76-2f5c828f58cd',
    packageJsonChecksum: null,
    yarnLockChecksum: null,
  },
  objects: [],
  fields: [],
  logicFunctions: [],
  frontComponents: [],
  permissionFlags: [],
  roles: [],
  skills: [],
  agents: [],
  views: [],
  viewFields: [],
  navigationMenuItems: [],
  pageLayouts: [],
  pageLayoutTabs: [],
  pageLayoutWidgets: [],
  commandMenuItems: [],
  timelineActivityTypes: [],
  settingsMenuItems: [],
  publicAssets: [],
};

const BASE = {
  version: 2,
  target: TARGET,
  applicationUniversalIdentifier: MANIFEST.application.universalIdentifier,
  manifest: MANIFEST,
};

describe('target-bound CLI pull base', () => {
  let appPath: string;
  let basePath: string;
  let controller: AbortController;

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-pull-base-'));
    basePath = join(appPath, PULL_BASE_FILE_PATH);
    controller = new AbortController();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(appPath, { recursive: true, force: true });
  });

  const record = () =>
    writePullBase({
      appPath,
      manifest: MANIFEST,
      target: TARGET,
      signal: controller.signal,
    });
  const read = (
    target = TARGET,
    applicationUniversalIdentifier = MANIFEST.application.universalIdentifier,
  ) =>
    readTargetBoundPullBase({
      appPath,
      target,
      applicationUniversalIdentifier,
    });
  const seed = async (contents: string) => {
    await mkdir(join(appPath, '.twenty/cli'), { recursive: true });
    await writeFile(basePath, contents);
  };

  it('round-trips a base across equivalent URL and UUID spellings', async () => {
    await writePullBase({
      appPath,
      manifest: MANIFEST,
      target: {
        apiUrl: 'HTTPS://CRM.EXAMPLE.TEST:443/api///',
        workspaceId: TARGET.workspaceId.toUpperCase(),
      },
      signal: controller.signal,
    });

    expect(
      await read(
        {
          apiUrl: `${TARGET.apiUrl}/`,
          workspaceId: TARGET.workspaceId.toUpperCase(),
        },
        MANIFEST.application.universalIdentifier.toUpperCase(),
      ),
    ).toMatchObject({ status: 'used', manifest: MANIFEST });
    expect(JSON.parse(await readFile(basePath, 'utf8'))).toEqual(BASE);
    expect((await stat(basePath)).mode & 0o777).toBe(0o600);
  });

  it('stores source fingerprints sorted by path and reads them back', async () => {
    const roleFingerprint = 'a'.repeat(64);
    const objectFingerprint = 'b'.repeat(64);

    await writePullBase({
      appPath,
      manifest: MANIFEST,
      target: TARGET,
      sourceFingerprints: {
        'src/role.ts': roleFingerprint,
        'src/object.ts': objectFingerprint,
      },
      signal: controller.signal,
    });

    expect(await read()).toMatchObject({
      status: 'used',
      sourceFingerprints: {
        'src/object.ts': objectFingerprint,
        'src/role.ts': roleFingerprint,
      },
    });
    expect(
      Object.keys(
        JSON.parse(await readFile(basePath, 'utf8')).sourceFingerprints,
      ),
    ).toEqual(['src/object.ts', 'src/role.ts']);
  });

  it.each([
    [
      { ...TARGET, apiUrl: 'https://other.example.test/api' },
      MANIFEST.application.universalIdentifier,
    ],
    [
      { ...TARGET, apiUrl: 'https://crm.example.test/other' },
      MANIFEST.application.universalIdentifier,
    ],
    [
      { ...TARGET, workspaceId: MANIFEST.application.universalIdentifier },
      MANIFEST.application.universalIdentifier,
    ],
    [TARGET, TARGET.workspaceId],
  ])(
    'ignores a baseline for another target or app: %j %s',
    async (target, identifier) => {
      await record();

      expect(await read(target, identifier)).toEqual({
        status: 'other-target',
        manifest: null,
      });
    },
  );

  it('ignores the legacy SDK base', async () => {
    await mkdir(join(appPath, '.twenty'));
    await writeFile(
      join(appPath, '.twenty/pull-base.json'),
      JSON.stringify(BASE),
    );

    expect(await read()).toEqual({ status: 'missing', manifest: null });
  });

  it.each([
    [
      'legacy unbound',
      JSON.stringify({ version: 1, manifest: MANIFEST }),
      'unbound',
    ],
    ['truncated JSON', '{"version":2', 'unreadable'],
    [
      'non-object manifest',
      JSON.stringify({
        ...BASE,
        manifest: null,
      }),
      'unreadable',
    ],
    [
      'non-object application',
      JSON.stringify({ ...BASE, manifest: { application: null } }),
      'unreadable',
    ],
    [
      'non-string application UUID',
      JSON.stringify({
        ...BASE,
        manifest: { application: { universalIdentifier: 42 } },
      }),
      'unreadable',
    ],
    [
      'wrong manifest UUID',
      JSON.stringify({
        ...BASE,
        applicationUniversalIdentifier: TARGET.workspaceId,
      }),
      'unreadable',
    ],
    [
      'invalid target UUID',
      JSON.stringify({
        ...BASE,
        target: { ...TARGET, workspaceId: 'invalid' },
      }),
      'unreadable',
    ],
    [
      'credentialed URL',
      JSON.stringify({
        ...BASE,
        target: { ...TARGET, apiUrl: 'https://secret@crm.example.test' },
      }),
      'unreadable',
    ],
    [
      'invalid unresolved UUID',
      JSON.stringify({
        ...BASE,
        unreconciledUniversalIdentifiers: ['invalid'],
      }),
      'unreadable',
    ],
    [
      'invalid source fingerprint',
      JSON.stringify({
        ...BASE,
        sourceFingerprints: { 'src/role.ts': 'not-a-sha256' },
      }),
      'unreadable',
    ],
    [
      'non-object source fingerprints',
      JSON.stringify({ ...BASE, sourceFingerprints: ['src/role.ts'] }),
      'unreadable',
    ],
  ])(
    'falls back without a baseline for %s',
    async (_name, contents, status) => {
      await seed(contents);

      expect(await read()).toEqual({ status, manifest: null });
      expect(await readFile(basePath, 'utf8')).toBe(contents);
    },
  );

  it.each([
    { application: MANIFEST.application },
    { ...MANIFEST, settingsMenuItems: null, objects: null },
    { ...MANIFEST, futureCollection: [{ name: 'preserved' }] },
  ])(
    'reads stored collections without normalizing or validating their schema',
    async (manifest) => {
      const contents = JSON.stringify({ ...BASE, manifest });
      await seed(contents);

      expect(await read()).toMatchObject({ status: 'used', manifest });
      expect(await readFile(basePath, 'utf8')).toBe(contents);
    },
  );

  it('rejects a linked baseline instead of reading another file', async () => {
    const otherPath = join(appPath, 'other.json');
    await writeFile(otherPath, JSON.stringify(BASE));
    await mkdir(join(appPath, '.twenty/cli'), { recursive: true });
    await symlink(otherPath, basePath);

    await expect(read()).rejects.toThrow('symbolic links');
  });

  it('keeps the prior base until the complete replacement is renamed', async () => {
    await seed('previous base');
    const original =
      await vi.importActual<typeof fileSystemPromises>('node:fs/promises');
    vi.mocked(rename).mockImplementationOnce(async (source, destination) => {
      expect(await readFile(basePath, 'utf8')).toBe('previous base');
      expect(JSON.parse(await readFile(source, 'utf8'))).toEqual(BASE);
      await original.rename(source, destination);
    });

    await record();

    expect(await read()).toMatchObject({ status: 'used', manifest: MANIFEST });
    expect(await readdir(join(appPath, '.twenty/cli'))).toEqual([
      'pull-base.json',
    ]);
  });

  it('preserves the old base and removes staging files when rename fails', async () => {
    await seed('previous base');
    vi.mocked(rename).mockRejectedValueOnce(new Error('disk error'));

    await expect(record()).rejects.toMatchObject({
      code: 'PULL_BASE_RECORD_FAILED',
    });

    expect(await readFile(basePath, 'utf8')).toBe('previous base');
    expect(await readdir(join(appPath, '.twenty/cli'))).toEqual([
      'pull-base.json',
    ]);
  });

  it('preserves the old base when cancelled after staging but before commit', async () => {
    await seed('previous base');
    const original =
      await vi.importActual<typeof fileSystemPromises>('node:fs/promises');
    vi.mocked(open).mockImplementationOnce(async (...args) => {
      const handle = await original.open(...args);
      const sync = handle.sync.bind(handle);
      vi.spyOn(handle, 'sync').mockImplementationOnce(async () => {
        await sync();
        controller.abort();
      });
      return handle;
    });

    await expect(record()).rejects.toMatchObject({ name: 'AbortError' });

    expect(await readFile(basePath, 'utf8')).toBe('previous base');
    expect(await readdir(join(appPath, '.twenty/cli'))).toEqual([
      'pull-base.json',
    ]);
  });

  it('reports a completed write when cancellation arrives after commit', async () => {
    const original =
      await vi.importActual<typeof fileSystemPromises>('node:fs/promises');
    vi.mocked(rename).mockImplementationOnce(async (...args) => {
      await original.rename(...args);
      controller.abort();
    });

    await expect(record()).resolves.toBeUndefined();
    expect(await read()).toMatchObject({ status: 'used', manifest: MANIFEST });
  });
  it.each([
    { objects: [null] },
    { fields: [42] },
    { translations: 'malformed' },
    { translations: { fr: { invalid: 42 } } },
    {
      objects: [
        { universalIdentifier: 'object', nameSingular: 'pet', fields: [null] },
      ],
    },
  ])(
    'treats malformed entity collections as an unreadable base',
    async (collections) => {
      await seed(
        JSON.stringify({ ...BASE, manifest: { ...MANIFEST, ...collections } }),
      );
      expect(await read()).toEqual({ status: 'unreadable', manifest: null });
    },
  );
});
