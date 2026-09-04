import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { buildPullEntities } from '@/cli/utilities/pull/build-pull-entities';
import { writeDefineFile } from '@/cli/utilities/pull/write-define-file';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const PACKAGE_ROOT = resolve(__dirname, '../../../../..');

const APP_UID = '11111111-1111-4111-8111-111111111111';
const PET_UID = '22222222-2222-4222-8222-222222222222';
const PET_NAME_FIELD_UID = '33333333-3333-4333-8333-333333333333';
const PET_AGE_FIELD_UID = '44444444-4444-4444-8444-444444444444';
const PET_STATUS_FIELD_UID = '55555555-5555-4555-8555-555555555555';
const PET_OWNER_FIELD_UID = '66666666-6666-4666-8666-666666666666';
const COMPANY_PETS_FIELD_UID = '77777777-7777-4777-8777-777777777777';
const COMPANY_TAGLINE_FIELD_UID = '88888888-8888-4888-8888-888888888888';
const INDEX_UID = '99999999-9999-4999-8999-999999999999';
const INDEX_FIELD_UID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

const EXPORTED_MANIFEST = {
  application: {
    universalIdentifier: APP_UID,
    displayName: 'Pet Care',
    description: 'Pets and the companies that care for them',
    defaultRoleUniversalIdentifier: '20202020-02c2-43f2-b94d-cab1f2b532eb',
    packageJsonChecksum: 'a-package-json-checksum',
    yarnLockChecksum: 'a-yarn-lock-checksum',
  },
  objects: [
    {
      universalIdentifier: PET_UID,
      nameSingular: 'pet',
      namePlural: 'pets',
      labelSingular: 'Pet',
      labelPlural: 'Pets',
      description: 'A pet',
      icon: 'IconPaw',
      color: null,
      isLabelSyncedWithName: false,
      isSearchable: true,
      isUICreatable: true,
      isUIEditable: true,
      writability: 'OPEN',
      openRecordIn: 'USER_CHOICE',
      imageIdentifierFieldMetadataUniversalIdentifier: null,
      labelIdentifierFieldMetadataUniversalIdentifier: PET_NAME_FIELD_UID,
      fields: [
        {
          universalIdentifier: PET_NAME_FIELD_UID,
          type: 'TEXT',
          name: 'name',
          label: 'Name',
          description: 'Name',
          icon: 'IconAbc',
          options: null,
          universalSettings: null,
          defaultValue: "''",
          isUIEditable: true,
          writability: 'OPEN',
          isNullable: false,
          isUnique: false,
          isLabelSyncedWithName: false,
        },
        {
          universalIdentifier: PET_AGE_FIELD_UID,
          type: 'NUMBER',
          name: 'age',
          label: 'Age',
          options: null,
          universalSettings: { dataType: 'bigint', type: 'number' },
          defaultValue: null,
          isUIEditable: true,
          writability: 'OPEN',
          isNullable: true,
          isUnique: false,
          isLabelSyncedWithName: false,
        },
        {
          universalIdentifier: PET_STATUS_FIELD_UID,
          type: 'SELECT',
          name: 'status',
          label: 'Status',
          options: [
            {
              id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
              value: 'HEALTHY',
              label: 'Healthy',
              color: 'green',
              position: 0,
            },
          ],
          universalSettings: null,
          defaultValue: "'HEALTHY'",
          isUIEditable: true,
          writability: 'OPEN',
          isNullable: true,
          isUnique: false,
          isLabelSyncedWithName: false,
        },
        {
          universalIdentifier: PET_OWNER_FIELD_UID,
          type: 'RELATION',
          name: 'owner',
          label: 'Owner',
          options: null,
          defaultValue: null,
          isUIEditable: true,
          writability: 'OPEN',
          isNullable: true,
          isUnique: false,
          isLabelSyncedWithName: false,
          relationTargetFieldMetadataUniversalIdentifier:
            COMPANY_PETS_FIELD_UID,
          relationTargetObjectMetadataUniversalIdentifier:
            STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company,
          universalSettings: {
            relationType: 'MANY_TO_ONE',
            onDelete: 'SET_NULL',
            joinColumnName: 'ownerId',
          },
        },
      ],
    },
  ],
  fields: [
    {
      universalIdentifier: COMPANY_TAGLINE_FIELD_UID,
      type: 'TEXT',
      name: 'tagline',
      label: 'Tagline',
      options: null,
      universalSettings: null,
      defaultValue: null,
      isUIEditable: true,
      writability: 'OPEN',
      isNullable: true,
      isUnique: false,
      isLabelSyncedWithName: false,
      objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company,
    },
  ],
  indexes: [
    {
      universalIdentifier: INDEX_UID,
      objectUniversalIdentifier: PET_UID,
      indexType: 'BTREE',
      isUnique: false,
      fields: [
        {
          universalIdentifier: INDEX_FIELD_UID,
          fieldUniversalIdentifier: PET_NAME_FIELD_UID,
        },
      ],
    },
  ],
} as unknown as Manifest;

const canonicalize = (value: unknown): unknown =>
  Array.isArray(value)
    ? value.map(canonicalize)
    : value !== null && typeof value === 'object'
      ? Object.fromEntries(
          Object.keys(value as Record<string, unknown>)
            .sort()
            .map((key) => [
              key,
              canonicalize((value as Record<string, unknown>)[key]),
            ]),
        )
      : value;

const sortByUniversalIdentifier = <T extends { universalIdentifier: string }>(
  entries: T[],
): T[] =>
  [...entries].sort((left, right) =>
    left.universalIdentifier.localeCompare(right.universalIdentifier),
  );

const withSortedFields = (objectManifest: {
  fields: { universalIdentifier: string }[];
}) => ({
  ...objectManifest,
  fields: sortByUniversalIdentifier(objectManifest.fields),
});

describe('pull round trip', () => {
  let appPath: string;
  let builtManifest: Manifest | null;
  let buildErrors: string[];

  beforeAll(async () => {
    appPath = await mkdtemp(join(PACKAGE_ROOT, '.pull-round-trip-'));

    await writeFile(
      join(appPath, 'package.json'),
      `${JSON.stringify(
        { name: 'pull-round-trip-app', version: '1.0.0', private: true },
        null,
        2,
      )}\n`,
    );

    const { entities, skipped } = buildPullEntities(EXPORTED_MANIFEST);

    expect(skipped).toEqual([]);

    for (const entity of entities) {
      const filePath = join(
        appPath,
        entity.defaultFolder,
        `${entity.fileBaseName}${entity.fileSuffix}`,
      );

      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(
        filePath,
        writeDefineFile({
          definer: entity.definer,
          config: entity.config,
          enumBindings: entity.enumBindings,
        }),
      );
    }

    const buildResult = await buildManifest(appPath);

    builtManifest = buildResult.manifest;
    buildErrors = buildResult.errors;
  }, 60000);

  afterAll(async () => {
    await rm(appPath, { recursive: true, force: true });
  });

  it('should build the written source without errors', () => {
    expect(buildErrors).toEqual([]);
    expect(builtManifest).not.toBeNull();
  });

  it('should rebuild the exported objects, fields and indexes unchanged', () => {
    expect(
      canonicalize(
        sortByUniversalIdentifier(builtManifest?.objects ?? []).map(
          withSortedFields,
        ),
      ),
    ).toEqual(
      canonicalize(
        sortByUniversalIdentifier(EXPORTED_MANIFEST.objects).map(
          withSortedFields,
        ),
      ),
    );

    expect(
      canonicalize(sortByUniversalIdentifier(builtManifest?.fields ?? [])),
    ).toEqual(
      canonicalize(sortByUniversalIdentifier(EXPORTED_MANIFEST.fields)),
    );

    expect(
      canonicalize(sortByUniversalIdentifier(builtManifest?.indexes ?? [])),
    ).toEqual(
      canonicalize(sortByUniversalIdentifier(EXPORTED_MANIFEST.indexes ?? [])),
    );
  });

  it('should rebuild the application header, leaving the build to recompute its checksums', () => {
    const builtApplication = builtManifest?.application as unknown as Record<
      string,
      unknown
    >;

    expect(builtApplication.universalIdentifier).toBe(APP_UID);
    expect(builtApplication.displayName).toBe('Pet Care');
    expect(builtApplication.description).toBe(
      'Pets and the companies that care for them',
    );
    expect(builtApplication.defaultRoleUniversalIdentifier).toBe(
      '20202020-02c2-43f2-b94d-cab1f2b532eb',
    );
    expect(builtApplication.packageJsonChecksum).toBeNull();
    expect(builtApplication.yarnLockChecksum).toBeNull();
  });
});
