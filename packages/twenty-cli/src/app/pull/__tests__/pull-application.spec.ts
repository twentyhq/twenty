import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateMessageId } from 'twenty-shared/i18n';

import { collectSourceFingerprints } from '@/app/pull/collect-source-fingerprints';
import { pullApplication } from '@/app/pull/pull-application';
import { writePullBase } from '@/app/pull/write-pull-base';
import { parseAppExport } from '@/app/parse-app-export';
import { readSourceIdentity } from '@/app/worker/read-source-identity';
const readAppIdentity = ({ appPath }: { appPath: string }) =>
  readSourceIdentity({ appPath, signal: new AbortController().signal });
import { type PullTarget as AppPullTarget } from '@/app/types/pull-target.type';
import { type ToolingResult as BuildResult } from '@/app/types/tooling-result.type';
import * as fileUtilities from '@/app/fs-utils';
import { type AppExportCoverageEntry } from '@/app/types/app-export.type';
import * as sourceScanner from '@/app/source/scan-project-source-files';

const APPLICATION_IDENTIFIER = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const OBJECT_IDENTIFIER = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const FIELD_IDENTIFIER = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const WORKSPACE_IDENTIFIER = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const OTHER_IDENTIFIER = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const INDEX_IDENTIFIER = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
const STANDALONE_FIELD_IDENTIFIER = 'abababab-abab-4aba-8aba-abababababab';
const STANDALONE_FIELD_PATH = 'src/fields/rating.ts';
const TARGET: AppPullTarget = {
  apiUrl: 'https://example.test',
  workspaceId: WORKSPACE_IDENTIFIER,
};
const OBJECT_PATH = 'src/objects/pet.object.ts';
const BASE_PATH = '.twenty/cli/pull-base.json';
const APPLICATION_EXPORT_COVERAGE_STATUSES = [
  'EXPORTED',
  'UNSUPPORTED',
  'FOREIGN_OWNED',
  'EXCLUDED',
  'ENGINE_DERIVED',
  'FUTURE_STATUS',
];

const createExport = ({
  includeObject = true,
  label = 'Pet',
  coverage = [],
}: {
  includeObject?: boolean;
  label?: string;
  coverage?: AppExportCoverageEntry[];
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

const sha256 = (content: string) =>
  createHash('sha256').update(content).digest('hex');

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
  const pull = async (
    applicationExport: unknown = createExport(),
    target = TARGET,
    signal?: AbortSignal,
  ) => {
    try {
      return await pullApplication({
        appPath,
        applicationExport: parseAppExport({
          value: applicationExport,
          universalIdentifier: APPLICATION_IDENTIFIER,
        }),
        target,
        signal: signal ?? new AbortController().signal,
      });
    } catch (error) {
      return {
        success: false as const,
        error: { code: 'PULL_FAILED', message: String(error) },
        diagnostics: [],
      };
    }
  };
  const recordAppliedBase = async () =>
    writePullBase({
      appPath,
      manifest: parseAppExport({
        value: createExport(),
        universalIdentifier: APPLICATION_IDENTIFIER,
      }).manifest,
      target: TARGET,
      sourceFingerprints: await collectSourceFingerprints(appPath),
      signal: new AbortController().signal,
    });
  const addStandaloneField = async () => {
    await mkdir(join(appPath, 'src/fields'), { recursive: true });
    await writeFile(
      join(appPath, STANDALONE_FIELD_PATH),
      `import { defineField, FieldType } from 'twenty-sdk/define';
export default defineField({
  universalIdentifier: '${STANDALONE_FIELD_IDENTIFIER}',
  objectUniversalIdentifier: '${OBJECT_IDENTIFIER}',
  name: 'rating',
  label: 'Rating',
  type: FieldType.NUMBER,
});
`,
    );
    const exported = createExport();
    exported.manifest.objects[0].fields.push({
      universalIdentifier: STANDALONE_FIELD_IDENTIFIER,
      name: 'rating',
      label: 'Rating',
      type: 'NUMBER',
    });
    return exported;
  };
  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-sdk-pull-'));
    await mkdir(join(appPath, 'node_modules'));
    await symlink(
      resolve('../twenty-sdk'),
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
    expect(await readdir(join(appPath, '.twenty/cli'))).toEqual([
      'pull-base.json',
    ]);
  });
  it.each([
    { hasBase: true, uppercaseIdentifier: false },
    { hasBase: false, uppercaseIdentifier: false },
    { hasBase: true, uppercaseIdentifier: true },
  ])(
    'keeps standalone fields separate, base: $hasBase, uppercase identifier: $uppercaseIdentifier',
    async ({ hasBase, uppercaseIdentifier }) => {
      requireSuccess(await pull());
      const exported = await addStandaloneField();
      if (uppercaseIdentifier) {
        await writeFile(
          join(appPath, STANDALONE_FIELD_PATH),
          (await read(STANDALONE_FIELD_PATH)).replace(
            STANDALONE_FIELD_IDENTIFIER,
            STANDALONE_FIELD_IDENTIFIER.toUpperCase(),
          ),
        );
      }
      const originalField = await read(STANDALONE_FIELD_PATH);

      if (hasBase) {
        await writePullBase({
          appPath,
          manifest: exported.manifest,
          target: TARGET,
          sourceFingerprints: await collectSourceFingerprints(appPath),
          signal: new AbortController().signal,
        });
      } else {
        await rm(join(appPath, BASE_PATH));
      }
      exported.manifest.objects[0].labelSingular = 'Changed remotely';

      const result = requireSuccess(await pull(exported));
      expect(result.skipped).toEqual([]);
      expect(result.deletions).toEqual([]);
      expect(await read(OBJECT_PATH)).toContain('Changed remotely');
      expect(await read(OBJECT_PATH)).toContain(FIELD_IDENTIFIER);
      expect(await read(OBJECT_PATH)).not.toContain(
        STANDALONE_FIELD_IDENTIFIER,
      );
      if (hasBase) {
        expect(await read(STANDALONE_FIELD_PATH)).toBe(originalField);
      }
      expect(JSON.parse(await read(BASE_PATH)).manifest).toEqual(
        exported.manifest,
      );
      expect(requireSuccess(await pull(exported)).writes).toEqual([]);

      await writeFile(
        join(appPath, STANDALONE_FIELD_PATH),
        (await read(STANDALONE_FIELD_PATH)).replace('Rating', 'Local rating'),
      );
      exported.manifest.objects[0].fields[1].label = 'Remote rating';

      const fieldUpdate = requireSuccess(await pull(exported));
      expect(fieldUpdate.writes).toEqual([
        expect.objectContaining({ relativePath: STANDALONE_FIELD_PATH }),
      ]);
      expect(fieldUpdate.overwrittenLocalChanges).toEqual([
        {
          universalIdentifier: STANDALONE_FIELD_IDENTIFIER,
          relativePath: STANDALONE_FIELD_PATH,
        },
      ]);
      expect(await read(STANDALONE_FIELD_PATH)).toContain('Remote rating');
      expect(requireSuccess(await pull(exported)).writes).toEqual([]);
    },
  );
  it('repairs an already duplicated standalone field even when the export is unchanged', async () => {
    requireSuccess(await pull());
    const exported = await addStandaloneField();
    await rm(join(appPath, STANDALONE_FIELD_PATH));
    requireSuccess(await pull(exported));
    await addStandaloneField();

    const repaired = requireSuccess(await pull(exported));

    expect(repaired.skipped).toEqual([]);
    expect(repaired.writes).toEqual([
      expect.objectContaining({ relativePath: OBJECT_PATH }),
    ]);
    expect(await read(OBJECT_PATH)).not.toContain(STANDALONE_FIELD_IDENTIFIER);
    expect(await readdir(join(appPath, 'src/fields'))).toEqual(['rating.ts']);
    expect(await read(STANDALONE_FIELD_PATH)).toContain(
      STANDALONE_FIELD_IDENTIFIER,
    );
    expect(requireSuccess(await pull(exported)).writes).toEqual([]);
  });
  it('preserves covered standalone fields and removes confirmed remote deletions', async () => {
    requireSuccess(await pull());
    const exported = await addStandaloneField();
    requireSuccess(await pull(exported));
    const originalField = await read(STANDALONE_FIELD_PATH);
    const withoutField = createExport({
      label: 'Changed remotely',
      coverage: [
        {
          metadataName: 'fieldMetadata',
          universalIdentifier: STANDALONE_FIELD_IDENTIFIER,
          status: 'UNSUPPORTED',
          reason: 'unsupported field',
        },
      ],
    });

    expect(requireSuccess(await pull(withoutField)).deletions).toEqual([]);
    expect(await read(STANDALONE_FIELD_PATH)).toBe(originalField);
    const removed = requireSuccess(
      await pull({ ...withoutField, coverage: [] }),
    );
    expect(removed.deletions).toEqual([
      {
        universalIdentifier: STANDALONE_FIELD_IDENTIFIER,
        relativePath: STANDALONE_FIELD_PATH,
      },
    ]);
    await expect(read(STANDALONE_FIELD_PATH)).rejects.toThrow();
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
  it('does not report a hand-written file that is unchanged since apply fingerprinted it', async () => {
    requireSuccess(await pull());
    await writeFile(
      join(appPath, OBJECT_PATH),
      (await read(OBJECT_PATH)).replace(
        "labelSingular: 'Pet'",
        'labelSingular: "Pet"',
      ),
    );
    await recordAppliedBase();
    const changed = requireSuccess(
      await pull(createExport({ label: 'Remote pet' })),
    );
    expect(changed.overwrittenLocalChanges).toEqual([]);
    expect(await read(OBJECT_PATH)).toContain("labelSingular: 'Remote pet'");
  });
  it('reports an edit made after apply fingerprinted the file', async () => {
    requireSuccess(await pull());
    await recordAppliedBase();
    await writeFile(
      join(appPath, OBJECT_PATH),
      (await read(OBJECT_PATH)).replace(
        "labelSingular: 'Pet'",
        "labelSingular: 'My local pet'",
      ),
    );
    expect(
      requireSuccess(await pull(createExport({ label: 'Remote pet' })))
        .overwrittenLocalChanges,
    ).toEqual([
      { universalIdentifier: OBJECT_IDENTIFIER, relativePath: OBJECT_PATH },
    ]);
  });
  it('carries fingerprints across pulls, updating rewritten files and dropping deleted ones', async () => {
    requireSuccess(await pull());
    await recordAppliedBase();
    const applied = JSON.parse(await read(BASE_PATH)).sourceFingerprints;
    requireSuccess(await pull(createExport({ label: 'Remote pet' })));
    const pulled = JSON.parse(await read(BASE_PATH)).sourceFingerprints;
    expect(pulled[OBJECT_PATH]).toBe(sha256(await read(OBJECT_PATH)));
    expect(pulled[OBJECT_PATH]).not.toBe(applied[OBJECT_PATH]);
    expect(pulled['src/application.config.ts']).toBe(
      applied['src/application.config.ts'],
    );
    requireSuccess(await pull(createExport({ includeObject: false })));
    expect(
      JSON.parse(await read(BASE_PATH)).sourceFingerprints,
    ).not.toHaveProperty([OBJECT_PATH]);
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
  it('retries a skipped replacement and applies a later confirmed nested deletion', async () => {
    const originalExport = createExport();
    originalExport.manifest.objects[0].fields.push({
      universalIdentifier: OTHER_IDENTIFIER,
      name: 'note',
      label: 'Note',
      type: 'TEXT',
    });
    requireSuccess(await pull(originalExport));
    const original = await read(OBJECT_PATH);
    const partialExport = createExport({
      label: 'Changed remotely',
      coverage: [
        {
          metadataName: 'fieldMetadata',
          universalIdentifier: OTHER_IDENTIFIER,
          status: 'UNSUPPORTED',
          reason: 'unsupported field',
        },
      ],
    });
    partialExport.manifest.application.displayName = 'Changed application';

    requireSuccess(await pull(partialExport));
    expect(await read(OBJECT_PATH)).toBe(original);
    const localApplication = (await read('src/application.config.ts')).replace(
      'Changed application',
      'Locally edited application',
    );
    await writeFile(
      join(appPath, 'src/application.config.ts'),
      localApplication,
    );

    const repeated = requireSuccess(await pull(partialExport));
    expect(repeated.skipped).toContainEqual(
      expect.objectContaining({ universalIdentifier: OBJECT_IDENTIFIER }),
    );
    expect(repeated.writes).toEqual([]);

    const completed = requireSuccess(
      await pull({ ...partialExport, coverage: [] }),
    );
    expect(completed.writes).toEqual([
      expect.objectContaining({ relativePath: OBJECT_PATH }),
    ]);
    expect(completed.skipped).toEqual([]);
    expect(completed.overwrittenLocalChanges).toEqual([]);
    expect(await read(OBJECT_PATH)).toContain('Changed remotely');
    expect(await read(OBJECT_PATH)).not.toContain(OTHER_IDENTIFIER);
    expect(await read('src/application.config.ts')).toBe(localApplication);
    expect(
      requireSuccess(await pull({ ...partialExport, coverage: [] })).writes,
    ).toEqual([]);
  });

  it('retries a skipped file without a prior base once its local-only child is removed', async () => {
    requireSuccess(await pull());
    const sourceWithoutChild = await read(OBJECT_PATH);
    const originalExport = createExport();
    originalExport.manifest.objects[0].fields.push({
      universalIdentifier: OTHER_IDENTIFIER,
      name: 'note',
      label: 'Note',
      type: 'TEXT',
    });
    requireSuccess(await pull(originalExport));
    await rm(join(appPath, BASE_PATH));
    const changed = createExport({ label: 'Changed remotely' });
    expect(requireSuccess(await pull(changed)).skipped).toHaveLength(1);

    await writeFile(join(appPath, OBJECT_PATH), sourceWithoutChild);

    const result = requireSuccess(await pull(changed));
    expect(result.writes).toContainEqual(
      expect.objectContaining({ relativePath: OBJECT_PATH }),
    );
    expect(result.skipped).toEqual([]);
    expect(await read(OBJECT_PATH)).toContain('Changed remotely');
  });

  it('retries a skipped application declaration without a prior base', async () => {
    requireSuccess(await pull());
    const applicationPath = 'src/application.config.ts';
    const originalApplication = await read(applicationPath);
    await writeFile(
      join(appPath, applicationPath),
      originalApplication.replace(
        "displayName: 'Pets',",
        `displayName: 'Pets', postInstallLogicFunction: { universalIdentifier: '${OTHER_IDENTIFIER}' },`,
      ),
    );
    await rm(join(appPath, BASE_PATH));
    const changed = createExport();
    changed.manifest.application.displayName = 'Changed remotely';

    expect(requireSuccess(await pull(changed)).skipped).toContainEqual(
      expect.objectContaining({
        universalIdentifier: APPLICATION_IDENTIFIER,
      }),
    );
    await writeFile(join(appPath, applicationPath), originalApplication);

    const result = requireSuccess(await pull(changed));
    expect(result.skipped).toEqual([]);
    expect(result.writes).toContainEqual(
      expect.objectContaining({ relativePath: applicationPath }),
    );
    expect(await read(applicationPath)).toContain('Changed remotely');
  });

  it('retains a covered whole-file base until its remote deletion is confirmed', async () => {
    requireSuccess(await pull());
    const partialExport = createExport({
      includeObject: false,
      coverage: [
        {
          metadataName: 'objectMetadata',
          universalIdentifier: OBJECT_IDENTIFIER,
          status: 'UNSUPPORTED',
          reason: 'unsupported object',
        },
      ],
    });
    requireSuccess(await pull(partialExport));
    const result = requireSuccess(
      await pull({ ...partialExport, coverage: [] }),
    );

    expect(result.deletions).toEqual([
      { universalIdentifier: OBJECT_IDENTIFIER, relativePath: OBJECT_PATH },
    ]);
    await expect(read(OBJECT_PATH)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('preserves application edits while a newly skipped default role is retried', async () => {
    const exported = createExport();
    const role = {
      universalIdentifier: OTHER_IDENTIFIER,
      label: 'Reader',
      objectPermissions: [
        {
          universalIdentifier: INDEX_IDENTIFIER,
          objectUniversalIdentifier: OBJECT_IDENTIFIER,
          canReadObjectRecords: true,
        },
      ],
    };
    requireSuccess(
      await pull({
        ...exported,
        manifest: { ...exported.manifest, roles: [role] },
      }),
    );
    await rm(join(appPath, BASE_PATH));
    const partialExport = {
      ...exported,
      manifest: {
        ...exported.manifest,
        roles: [{ ...role, label: 'Changed role', objectPermissions: [] }],
      },
    };
    const first = requireSuccess(await pull(partialExport));
    expect(first.skipped).toContainEqual(
      expect.objectContaining({ universalIdentifier: OTHER_IDENTIFIER }),
    );
    const localApplication = (await read('src/application.config.ts')).replace(
      'Pets',
      'Locally edited application',
    );
    await writeFile(
      join(appPath, 'src/application.config.ts'),
      localApplication,
    );

    const second = requireSuccess(await pull(partialExport));
    expect(second.skipped).toContainEqual(
      expect.objectContaining({ universalIdentifier: OTHER_IDENTIFIER }),
    );
    expect(second.writes).toEqual([]);
    expect(await read('src/application.config.ts')).toBe(localApplication);
  });

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
  it('does not infer deletions from malformed reconciliation state', async () => {
    requireSuccess(await pull());
    const base = JSON.parse(await read(BASE_PATH));
    base.unreconciledUniversalIdentifiers = ['not-an-identifier'];
    await writeFile(join(appPath, BASE_PATH), JSON.stringify(base));

    const result = requireSuccess(
      await pull(createExport({ includeObject: false })),
    );
    expect(result.base.status).toBe('unreadable');
    expect(result.deletions).toEqual([]);
    expect(await read(OBJECT_PATH)).toContain('defineObject');
  });
  it.each([
    null,
    {},
    { ...createExport(), coverage: undefined },
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
    expect(await readdir(join(appPath, '.twenty/cli'))).toEqual([
      'pull-base.json',
    ]);
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
    expect(await readdir(join(appPath, '.twenty/cli'))).toEqual([
      'pull-base.json',
    ]);
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
      error: { code: 'INVALID_API_URL' },
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
  it('accepts absent and null collections, preserves new server collections in the baseline', async () => {
    const exported = createExport();
    const data = requireSuccess(
      await pull({
        ...exported,
        manifest: {
          application: exported.manifest.application,
          fields: null,
          futureEntities: [
            { universalIdentifier: OTHER_IDENTIFIER, value: 'future' },
          ],
        },
      }),
    );
    expect(data.writes).toHaveLength(1);
    expect(JSON.parse(await read(BASE_PATH)).manifest).toEqual({
      application: exported.manifest.application,
      fields: null,
      futureEntities: [
        { universalIdentifier: OTHER_IDENTIFIER, value: 'future' },
      ],
    });
  });

  it('reports incomplete rollback and retains originals even if staging cleanup fails', async () => {
    requireSuccess(await pull());
    const original = await read(OBJECT_PATH);
    const originalCopy = fileUtilities.copy;
    vi.spyOn(fileUtilities, 'copy').mockImplementation(
      async (source, destination) => {
        if (
          source.includes('pull-staging-') ||
          source.includes('pull-backup-')
        ) {
          throw new Error('copy failed');
        }
        await originalCopy(source, destination);
      },
    );
    vi.spyOn(fileUtilities, 'remove').mockRejectedValue(
      new Error('cleanup failed'),
    );
    const result = await pull(createExport({ label: 'Changed' }));
    expect(result).toMatchObject({
      success: false,
      error: {
        code: 'PULL_FAILED',
        details: { outcome: 'unknown', backupDirectory: expect.any(String) },
      },
    });
    if (result.success || !('details' in result.error)) {
      throw new Error('Expected recovery details');
    }
    const details = result.error.details;
    const backupDirectory = details?.backupDirectory;
    if (typeof backupDirectory !== 'string') {
      throw new Error('Expected backup path');
    }
    expect(await readFile(join(backupDirectory, OBJECT_PATH), 'utf8')).toBe(
      original,
    );
  });

  it('reports a completed pull when only temporary directory cleanup fails', async () => {
    vi.spyOn(fileUtilities, 'remove').mockRejectedValue(
      new Error('cleanup failed'),
    );
    expect(await pull()).toMatchObject({
      success: false,
      error: { code: 'PULL_FAILED', details: { outcome: 'pulled' } },
    });
    expect(JSON.parse(await read(BASE_PATH))).toMatchObject({ version: 2 });
    expect(await read(OBJECT_PATH)).toContain('defineObject');
  });
  it('keeps a remotely deleted object file containing a new local field', async () => {
    requireSuccess(await pull());
    const local = (await read(OBJECT_PATH)).replace(
      'fields: [',
      `fields: [{
      universalIdentifier: '${INDEX_IDENTIFIER}', name: 'localNote', label: 'Local note', type: 'TEXT',
    },`,
    );
    await writeFile(join(appPath, OBJECT_PATH), local);

    const result = requireSuccess(
      await pull(createExport({ includeObject: false })),
    );

    expect(result.deletions).toEqual([]);
    expect(await read(OBJECT_PATH)).toBe(local);
    expect(result.skipped).toContainEqual(
      expect.objectContaining({
        kind: 'object',
        universalIdentifier: OBJECT_IDENTIFIER,
        reason: expect.stringContaining(INDEX_IDENTIFIER),
      }),
    );
  });
});
