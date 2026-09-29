import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateMessageId } from 'twenty-shared/i18n';

import { pullApp, readAppIdentity, recordAppBase } from '@/application-build';
import { type AppPullTarget } from '@/application-build/pull/types';
import { type BuildResult } from '@/application-build/types';
import * as fileUtilities from '@/cli/utilities/file/fs-utils';
import {
  APPLICATION_EXPORT_COVERAGE_STATUSES,
  type ApplicationExportCoverageEntry,
} from '@/cli/utilities/pull/application-export-type';
import { readPullBaseManifest } from '@/cli/utilities/pull/pull-base-file';
import * as sourceScanner from '@/cli/utilities/pull/scan-project-source-files';

const APPLICATION_IDENTIFIER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const OBJECT_IDENTIFIER = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const FIELD_IDENTIFIER = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const WORKSPACE_IDENTIFIER = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const OTHER_IDENTIFIER = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const INDEX_IDENTIFIER = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
const TARGET: AppPullTarget = {
  apiUrl: 'https://example.test',
  workspaceId: WORKSPACE_IDENTIFIER,
};
const OBJECT_PATH = 'src/objects/pet.object.ts';
const BASE_PATH = '.twenty/pull-base.json';

const createExport = ({
  includeObject = true,
  label = 'Pet',
  coverage = [],
}: {
  includeObject?: boolean;
  label?: string;
  coverage?: ApplicationExportCoverageEntry[];
} = {}) => ({
  application: {
    universalIdentifier: APPLICATION_IDENTIFIER,
    displayName: 'Pets',
    sourceType: 'LOCAL',
  },
  manifest: {
    application: {
      universalIdentifier: APPLICATION_IDENTIFIER,
      displayName: 'Pets',
      description: '',
      defaultRoleUniversalIdentifier: OTHER_IDENTIFIER,
      packageJsonChecksum: null,
      yarnLockChecksum: null,
    },
    objects: includeObject
      ? [
          {
            universalIdentifier: OBJECT_IDENTIFIER,
            nameSingular: 'pet',
            namePlural: 'pets',
            labelSingular: label,
            labelPlural: 'Pets',
            labelIdentifierFieldMetadataUniversalIdentifier: FIELD_IDENTIFIER,
            fields: [
              {
                universalIdentifier: FIELD_IDENTIFIER,
                name: 'name',
                label: 'Name',
                type: 'TEXT',
              },
            ],
          },
        ]
      : [],
    fields: [],
    indexes: [],
    logicFunctions: [],
    frontComponents: [],
    permissionFlags: [],
    roles: [],
    skills: [],
    agents: [],
    publicAssets: [],
    views: [],
    viewFields: [],
    navigationMenuItems: [],
    pageLayouts: [],
    pageLayoutTabs: [],
    pageLayoutWidgets: [],
    commandMenuItems: [],
    timelineActivityTypes: [],
    settingsMenuItems: [],
  },
  coverage,
  files: [],
});

const requireSuccess = <TData>(result: BuildResult<TData>): TData => {
  expect(result.success, JSON.stringify(result)).toBe(true);
  if (!result.success) {
    throw new Error(result.error.message);
  }
  return result.data;
};

describe('programmatic application pull', () => {
  let appPath: string;
  const read = (relativePath: string) =>
    readFile(join(appPath, relativePath), 'utf8');
  const pull = (
    applicationExport: unknown = createExport(),
    target = TARGET,
    signal?: AbortSignal,
  ) => pullApp({ appPath, applicationExport, target, signal });
  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-sdk-pull-'));
    await mkdir(join(appPath, 'node_modules'));
    await symlink(
      resolve('.'),
      join(appPath, 'node_modules/twenty-sdk'),
      'dir',
    );
    await writeFile(join(appPath, 'package.json'), '{"name":"pull-fixture"}\n');
  });
  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(appPath, { recursive: true, force: true });
  });

  it('writes source and a normalized target-bound base, without returning source contents', async () => {
    const data = requireSuccess(
      await pull(createExport(), {
        apiUrl: 'https://EXAMPLE.test/',
        workspaceId: WORKSPACE_IDENTIFIER.toUpperCase(),
      }),
    );
    expect(data.base.status).toBe('missing');
    expect(data.writes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ relativePath: OBJECT_PATH }),
      ]),
    );
    expect(data.writes.every((write) => !('content' in write))).toBe(true);
    expect(await read(OBJECT_PATH)).toContain("labelSingular: 'Pet'");
    expect(JSON.parse(await read(BASE_PATH))).toMatchObject({
      version: 2,
      target: TARGET,
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
    });
    expect(await readdir(join(appPath, '.twenty'))).toEqual(['pull-base.json']);
    expect(
      await readPullBaseManifest({
        appPath,
        applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      }),
    ).toBeNull();
  });
  it('reads identity while unrelated definitions cannot build', async () => {
    requireSuccess(await pull());
    await writeFile(
      join(appPath, 'src/broken.object.ts'),
      "import 'missing-dependency'; export default defineObject({",
    );
    expect(
      requireSuccess(await readAppIdentity({ appPath })).application,
    ).toEqual({
      universalIdentifier: APPLICATION_IDENTIFIER,
      displayName: 'Pets',
    });
  });
  it('returns no identity for an empty project', async () => {
    expect(requireSuccess(await readAppIdentity({ appPath }))).toEqual({
      application: null,
    });
  });
  it('rejects ambiguous or unreadable application declarations before writing', async () => {
    requireSuccess(await pull());
    const base = await read(BASE_PATH);
    await writeFile(
      join(appPath, 'src/second.ts'),
      await read('src/application.config.ts'),
    );
    expect(await pull()).toMatchObject({
      success: false,
      error: { code: 'PULL_FAILED' },
    });
    await rm(join(appPath, 'src/second.ts'));
    await writeFile(
      join(appPath, 'src/application.config.ts'),
      "import 'missing-package'; export default defineApplication({ universalIdentifier: 'broken' });",
    );
    expect(await readAppIdentity({ appPath })).toMatchObject({
      success: false,
      error: { code: 'IDENTITY_READ_FAILED' },
    });
    expect(await pull()).toMatchObject({ success: false });
    expect(await read(BASE_PATH)).toBe(base);
  });
  it('rejects a different application and accepts the same UUID in uppercase', async () => {
    requireSuccess(await pull());
    const source = await read('src/application.config.ts');
    await writeFile(
      join(appPath, 'src/application.config.ts'),
      source.replace(APPLICATION_IDENTIFIER, OTHER_IDENTIFIER),
    );
    expect(await pull()).toMatchObject({
      success: false,
      error: {
        code: 'PULL_FAILED',
        message: expect.stringContaining('different directory'),
      },
    });
    await writeFile(
      join(appPath, 'src/application.config.ts'),
      source.replace(
        APPLICATION_IDENTIFIER,
        APPLICATION_IDENTIFIER.toUpperCase(),
      ),
    );
    requireSuccess(await pull());
  });
  it('keeps local edits until the remote changes, then reports their overwrite', async () => {
    requireSuccess(await pull());
    const local = (await read(OBJECT_PATH)).replace(
      "labelSingular: 'Pet'",
      "labelSingular: 'My local pet'",
    );
    await writeFile(join(appPath, OBJECT_PATH), local);
    expect(requireSuccess(await pull()).writes).toEqual([]);
    expect(await read(OBJECT_PATH)).toBe(local);
    const changed = requireSuccess(
      await pull(createExport({ label: 'Remote pet' })),
    );
    expect(changed.overwrittenLocalChanges).toEqual([
      { universalIdentifier: OBJECT_IDENTIFIER, relativePath: OBJECT_PATH },
    ]);
    expect(await read(OBJECT_PATH)).toContain("labelSingular: 'Remote pet'");
  });
  it('does not report untouched generated files as conflicting edits', async () => {
    requireSuccess(await pull());
    expect(
      requireSuccess(await pull(createExport({ label: 'Remote pet' })))
        .overwrittenLocalChanges,
    ).toEqual([]);
  });
  it.each(APPLICATION_EXPORT_COVERAGE_STATUSES)(
    'preserves a base entity still mentioned by %s coverage',
    async (status) => {
      requireSuccess(await pull());
      const original = await read(OBJECT_PATH);
      const data = requireSuccess(
        await pull(
          createExport({
            includeObject: false,
            coverage: [
              {
                metadataName: 'objectMetadata',
                universalIdentifier: OBJECT_IDENTIFIER,
                status,
                reason: null,
              },
            ],
          }),
        ),
      );
      expect(data.deletions).toEqual([]);
      expect(await read(OBJECT_PATH)).toBe(original);
    },
  );
  it('preserves an index skipped because its object is no longer exported', async () => {
    const exported = createExport();
    const index = {
      universalIdentifier: INDEX_IDENTIFIER,
      objectUniversalIdentifier: OBJECT_IDENTIFIER,
      isUnique: false,
      fields: [{ fieldUniversalIdentifier: FIELD_IDENTIFIER }],
    };
    const withIndex = {
      ...exported,
      manifest: { ...exported.manifest, indexes: [index] },
    };
    const first = requireSuccess(await pull(withIndex));
    const indexPath = first.writes.find(
      (write) => write.kind === 'index',
    )?.relativePath;
    if (!indexPath) {
      throw new Error('Missing index fixture');
    }
    const before = await read(indexPath);
    const result = requireSuccess(
      await pull({
        ...withIndex,
        manifest: { ...withIndex.manifest, objects: [] },
      }),
    );
    expect(result.skipped).toEqual([
      expect.objectContaining({ universalIdentifier: INDEX_IDENTIFIER }),
    ]);
    expect(
      result.deletions.every(
        (deletion) => deletion.universalIdentifier !== INDEX_IDENTIFIER,
      ),
    ).toBe(true);
    expect(await read(indexPath)).toBe(before);
  });

  it.each(['covered', 'covered-windows', 'no-base', 'confirmed-deletion'])(
    'preserves nested definitions unless their remote deletion is confirmed: %s',
    async (scenario) => {
      const originalExport = createExport();
      originalExport.manifest.objects[0].fields.push({
        universalIdentifier: OTHER_IDENTIFIER,
        name: 'note',
        label: 'Note',
        type: 'TEXT',
      });
      requireSuccess(await pull(originalExport));
      const original = await read(OBJECT_PATH);
      const changed = createExport({ label: 'Changed remotely' });

      if (scenario.startsWith('covered')) {
        changed.coverage.push({
          metadataName: 'fieldMetadata',
          universalIdentifier: OTHER_IDENTIFIER,
          status: 'UNSUPPORTED',
          reason: 'unsupported relation',
        });
      }
      if (scenario === 'no-base') {
        await rm(join(appPath, BASE_PATH));
      }
      if (scenario === 'covered-windows') {
        const scan = sourceScanner.scanProjectSourceFiles;
        vi.spyOn(sourceScanner, 'scanProjectSourceFiles').mockImplementation(
          async (...options) =>
            (await scan(...options)).map((file) => ({
              ...file,
              relativePath: file.relativePath.split('/').join('\\'),
            })),
        );
      }

      const result = requireSuccess(await pull(changed));

      if (scenario === 'confirmed-deletion') {
        expect(result.skipped).toEqual([]);
        expect(await read(OBJECT_PATH)).not.toContain(OTHER_IDENTIFIER);
        expect(await read(OBJECT_PATH)).toContain('Changed remotely');
      } else {
        expect(await read(OBJECT_PATH)).toBe(original);
        expect(result.skipped).toContainEqual({
          kind: 'object',
          universalIdentifier: OBJECT_IDENTIFIER,
          reason: expect.stringContaining(OTHER_IDENTIFIER),
        });
      }
    },
  );
  it('deletes a remotely removed base entity and preserves a local-only definition', async () => {
    requireSuccess(await pull());
    const local = (await read(OBJECT_PATH))
      .split(OBJECT_IDENTIFIER)
      .join(OTHER_IDENTIFIER);
    await writeFile(join(appPath, 'src/objects/local.object.ts'), local);
    const data = requireSuccess(
      await pull(createExport({ includeObject: false })),
    );
    expect(data.deletions).toEqual([
      { universalIdentifier: OBJECT_IDENTIFIER, relativePath: OBJECT_PATH },
    ]);
    expect(data.localOnlyRelativePaths).toEqual([
      'src/objects/local.object.ts',
    ]);
    await expect(read(OBJECT_PATH)).rejects.toMatchObject({ code: 'ENOENT' });
    expect(await read('src/objects/local.object.ts')).toBe(local);
  });
  it.each([
    'origin',
    'workspace',
    'application',
    'unbound',
    'unreadable',
    'missing',
  ])('does not infer deletions from a %s base', async (kind) => {
    requireSuccess(await pull());
    const exported = createExport();
    const base = {
      version: kind === 'unbound' ? 1 : 2,
      target: {
        apiUrl: kind === 'origin' ? 'https://other.test' : TARGET.apiUrl,
        workspaceId:
          kind === 'workspace' ? OTHER_IDENTIFIER : TARGET.workspaceId,
      },
      applicationUniversalIdentifier:
        kind === 'application' ? OTHER_IDENTIFIER : APPLICATION_IDENTIFIER,
      manifest: {
        ...exported.manifest,
        application: {
          ...exported.manifest.application,
          universalIdentifier:
            kind === 'application' ? OTHER_IDENTIFIER : APPLICATION_IDENTIFIER,
        },
      },
    };
    await writeFile(
      join(appPath, BASE_PATH),
      kind === 'unreadable' ? '{broken' : JSON.stringify(base),
    );
    if (kind === 'missing') {
      await rm(join(appPath, BASE_PATH));
    }
    const data = requireSuccess(
      await pull(createExport({ includeObject: false })),
    );
    expect(data.base.status).toBe(
      ['origin', 'workspace', 'application'].includes(kind)
        ? 'other-target'
        : kind,
    );
    expect(data.deletions).toEqual([]);
    expect(await read(OBJECT_PATH)).toContain('defineObject');
  });
  it('records an apply base without changing source files', async () => {
    requireSuccess(await pull());
    const original = await read(OBJECT_PATH);
    const changed = createExport({ label: 'Applied' });
    requireSuccess(
      await recordAppBase({
        appPath,
        applicationExport: changed,
        target: TARGET,
      }),
    );
    expect(await read(OBJECT_PATH)).toBe(original);
    expect(JSON.parse(await read(BASE_PATH))).toMatchObject({
      manifest: { objects: [{ labelSingular: 'Applied' }] },
    });
  });
  it.each([
    null,
    {},
    { ...createExport(), coverage: undefined },
    {
      ...createExport(),
      manifest: { ...createExport().manifest, objects: undefined },
    },
    {
      ...createExport(),
      application: {
        ...createExport().application,
        universalIdentifier: OTHER_IDENTIFIER,
      },
    },
    {
      ...createExport(),
      files: [{ folder: '.', path: 'package.json', content: '{}' }],
    },
  ])(
    'refuses an incomplete or unsupported export without writes (%#)',
    async (exported) => {
      expect(await pull(exported)).toMatchObject({
        success: false,
        error: { code: 'PULL_FAILED' },
      });
      expect((await readdir(appPath)).sort()).toEqual([
        'node_modules',
        'package.json',
      ]);
    },
  );
  it('rolls back replaced and deleted source when the final base commit fails', async () => {
    requireSuccess(await pull());
    const originalObject = await read(OBJECT_PATH);
    const originalApplication = await read('src/application.config.ts');
    const originalBase = await read(BASE_PATH);
    const originalCopy = fileUtilities.copy;
    vi.spyOn(fileUtilities, 'copy').mockImplementation(
      async (source, destination) => {
        if (
          source.includes('pull-staging-') &&
          destination === join(appPath, BASE_PATH)
        ) {
          throw new Error('base write failed');
        }
        await originalCopy(source, destination);
      },
    );
    const exported = createExport({ includeObject: false });
    exported.manifest.application.displayName = 'Changed app';
    expect(await pull(exported)).toMatchObject({
      success: false,
      error: { code: 'PULL_FAILED', message: 'base write failed' },
    });
    expect(await read(OBJECT_PATH)).toBe(originalObject);
    expect(await read('src/application.config.ts')).toBe(originalApplication);
    expect(await read(BASE_PATH)).toBe(originalBase);
    expect(await readdir(join(appPath, '.twenty'))).toEqual(['pull-base.json']);
  });
  it('returns the complete result after a commit succeeds despite cancellation', async () => {
    const controller = new AbortController();
    const originalCopy = fileUtilities.copy;
    let releaseCopy: () => void = () => undefined;
    const blockedCopy = new Promise<void>((resolveCopy) => {
      releaseCopy = resolveCopy;
    });
    let markStarted: () => void = () => undefined;
    const started = new Promise<void>((resolveStarted) => {
      markStarted = resolveStarted;
    });
    vi.spyOn(fileUtilities, 'copy').mockImplementation(
      async (source, destination) => {
        await originalCopy(source, destination);
        if (destination === join(appPath, 'src/application.config.ts')) {
          controller.abort(new Error('stop pull'));
          markStarted();
          await blockedCopy;
        }
      },
    );
    let settled = false;
    const pending = pull(createExport(), TARGET, controller.signal).then(
      (result) => {
        settled = true;
        return result;
      },
    );
    await started;
    expect(settled).toBe(false);
    releaseCopy();
    const result = requireSuccess(await pending);
    expect(result.writes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ relativePath: OBJECT_PATH }),
      ]),
    );
    expect(await read(OBJECT_PATH)).toContain('defineObject');
    expect(JSON.parse(await read(BASE_PATH))).toMatchObject({ version: 2 });
    expect(await readdir(join(appPath, '.twenty'))).toEqual(['pull-base.json']);
  });
  it('preserves an independent write failure racing with cancellation', async () => {
    requireSuccess(await pull());
    const base = await read(BASE_PATH);
    const controller = new AbortController();
    const originalCopy = fileUtilities.copy;
    vi.spyOn(fileUtilities, 'copy').mockImplementation(
      async (source, destination) => {
        if (source.includes('pull-staging-')) {
          controller.abort(new Error('stop'));
          throw new Error('disk failed');
        }
        await originalCopy(source, destination);
      },
    );
    expect(
      await pull(createExport({ label: 'Changed' }), TARGET, controller.signal),
    ).toMatchObject({
      success: false,
      error: { code: 'PULL_FAILED', message: 'disk failed' },
    });
    expect(await read(BASE_PATH)).toBe(base);
  });
  it('does not start writes for a pre-aborted call', async () => {
    expect(
      await pull(createExport(), TARGET, AbortSignal.abort()),
    ).toMatchObject({ success: false, error: { code: 'CANCELLED' } });
    expect((await readdir(appPath)).sort()).toEqual([
      'node_modules',
      'package.json',
    ]);
  });

  it('preserves a compiled locale from an unbound checkout', async () => {
    await mkdir(join(appPath, 'locales/compiled'), { recursive: true });
    const local = '{"local-id":"Local translation"}\n';
    await writeFile(join(appPath, 'locales/compiled/fr-FR.json'), local);
    const exported = createExport();
    const data = requireSuccess(
      await pull({
        ...exported,
        manifest: {
          ...exported.manifest,
          translations: {
            'fr-FR': {
              [generateMessageId('Pet', 'objectMetadata.labelSingular')]:
                'Animal',
            },
          },
        },
      }),
    );
    expect(data.deletions).toEqual([]);
    expect(await read('locales/compiled/fr-FR.json')).toBe(local);
    expect(await read('locales/fr-FR.json')).toContain('Animal');
  });

  it('reports overwritten locale edits and removes only base-owned locales', async () => {
    const exported = createExport();
    const translationIdentifier = generateMessageId(
      'Pet',
      'objectMetadata.labelSingular',
    );
    const translated = {
      ...exported,
      manifest: {
        ...exported.manifest,
        translations: {
          'fr-FR': { [translationIdentifier]: 'Animal' },
        },
      },
    };
    requireSuccess(await pull(translated));
    await writeFile(
      join(appPath, 'locales/fr-FR.json'),
      (await read('locales/fr-FR.json')).replace('Animal', 'Local'),
    );
    const changed = requireSuccess(
      await pull({
        ...translated,
        manifest: {
          ...translated.manifest,
          translations: {
            'fr-FR': { [translationIdentifier]: 'Serveur' },
          },
        },
      }),
    );
    expect(changed.overwrittenLocalChanges).toContainEqual({
      universalIdentifier: 'fr-FR',
      relativePath: 'locales/fr-FR.json',
    });
    const removed = requireSuccess(
      await pull({
        ...exported,
        manifest: { ...exported.manifest, translations: {} },
      }),
    );
    expect(removed.deletions).toContainEqual({
      universalIdentifier: 'fr-FR',
      relativePath: 'locales/fr-FR.json',
    });
  });

  it('preserves the prior apply base on a failed record operation', async () => {
    requireSuccess(await pull());
    const originalBase = await read(BASE_PATH);
    const originalCopy = fileUtilities.copy;
    vi.spyOn(fileUtilities, 'copy').mockImplementation(
      async (source, destination) => {
        if (source.includes('pull-staging-')) {
          throw new Error('base write failed');
        }
        await originalCopy(source, destination);
      },
    );
    expect(
      await recordAppBase({
        appPath,
        applicationExport: createExport({ label: 'Changed' }),
        target: TARGET,
      }),
    ).toMatchObject({ success: false, error: { code: 'BASE_RECORD_FAILED' } });
    expect(await read(BASE_PATH)).toBe(originalBase);
  });

  it('reports a committed base as recorded even when cancelled during its write', async () => {
    const controller = new AbortController();
    const originalCopy = fileUtilities.copy;
    vi.spyOn(fileUtilities, 'copy').mockImplementation(
      async (source, destination) => {
        await originalCopy(source, destination);
        if (destination === join(appPath, BASE_PATH)) {
          controller.abort(new Error('stop'));
        }
      },
    );
    requireSuccess(
      await recordAppBase({
        appPath,
        applicationExport: createExport(),
        target: TARGET,
        signal: controller.signal,
      }),
    );
    expect(JSON.parse(await read(BASE_PATH))).toMatchObject({
      version: 2,
      target: TARGET,
    });
  });

  it('allows read-only symlinked helpers while preserving them', async () => {
    const outside = await mkdtemp(join(tmpdir(), 'twenty-pull-helpers-'));
    try {
      const helper = 'export const label = "shared";\n';
      await writeFile(join(outside, 'helper.ts'), helper);
      await mkdir(join(appPath, 'src'));
      await symlink(outside, join(appPath, 'src/shared'), 'dir');
      expect(requireSuccess(await readAppIdentity({ appPath }))).toEqual({
        application: null,
      });
      requireSuccess(await pull());
      expect(
        requireSuccess(await readAppIdentity({ appPath })).application
          ?.universalIdentifier,
      ).toBe(APPLICATION_IDENTIFIER);
      expect(await readFile(join(outside, 'helper.ts'), 'utf8')).toBe(helper);
    } finally {
      await rm(outside, { recursive: true, force: true });
    }
  });

  it.each([
    'https://user:password@example.test',
    'file:///tmp/example',
    'https://example.test/?secret=token',
  ])('refuses an unsafe target URL: %s', async (apiUrl) => {
    expect(await pull(createExport(), { ...TARGET, apiUrl })).toMatchObject({
      success: false,
      error: { code: 'PULL_FAILED' },
    });
    expect((await readdir(appPath)).sort()).toEqual([
      'node_modules',
      'package.json',
    ]);
  });
  it('refuses symlinked source and base destinations', async () => {
    const outside = await mkdtemp(join(tmpdir(), 'twenty-pull-outside-'));
    try {
      await symlink(outside, join(appPath, '.twenty'), 'dir');
      expect(await pull()).toMatchObject({
        success: false,
        error: { code: 'PULL_FAILED' },
      });
      expect(await readdir(outside)).toEqual([]);
      await rm(join(appPath, '.twenty'));
      await symlink(outside, join(appPath, 'src'), 'dir');
      expect(await pull()).toMatchObject({
        success: false,
        error: { code: 'PULL_FAILED' },
      });
      expect(await readdir(outside)).toEqual([]);
    } finally {
      await rm(outside, { recursive: true, force: true });
    }
  });
});
