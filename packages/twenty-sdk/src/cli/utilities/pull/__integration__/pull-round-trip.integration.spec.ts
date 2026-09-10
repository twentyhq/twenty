import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { buildPullEntities } from '@/cli/utilities/pull/build-pull-entities';
import { planTranslationWrites } from '@/cli/utilities/pull/plan-translation-writes';
import { stripGraphqlTypename } from '@/cli/utilities/pull/strip-graphql-typename';
import { compileApplicationTranslations } from '@/cli/utilities/translations/compile-application-translations';
import { writeDefineFile } from '@/cli/utilities/pull/write-define-file';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import {
  getFieldUniversalIdentifier,
  getSystemRecordPageLayoutUniversalIdentifier,
  getSystemViewUniversalIdentifier,
  type Manifest,
  SYSTEM_VIEW_KEYS,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { generateMessageId } from 'twenty-shared/i18n';
import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
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
const JUNCTION_UID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const JUNCTION_PET_FIELD_UID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const PET_AGREEMENTS_FIELD_UID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const VIEW_UID = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
const VIEW_NAME_FIELD_UID = '13131313-1313-4131-8131-131313131313';
const VIEW_AGE_FIELD_UID = '12121212-1212-4121-8121-121212121212';
const VIEW_FILTER_GROUP_UID = '14141414-1414-4141-8141-141414141414';
const VIEW_FILTER_UID = '15151515-1515-4151-8151-151515151515';
const VIEW_SORT_UID = '16161616-1616-4161-8161-161616161616';
const VIEW_GROUP_UID = '17171717-1717-4171-8171-171717171717';
const VIEW_FIELD_GROUP_UID = '18181818-1818-4181-8181-181818181818';
const COMPANY_INDEX_VIEW_FIELD_UID = '19191919-1919-4191-8191-191919191919';
const PET_PAGE_LAYOUT_UID = '21212121-2121-4212-8212-212121212121';
const PET_OVERVIEW_TAB_UID = '23232323-2323-4232-8232-232323232323';
const PET_FIELDS_WIDGET_UID = '24242424-2424-4242-8242-242424242424';
const DOCS_PAGE_LAYOUT_UID = '25252525-2525-4252-8252-252525252525';
const DOCS_TAB_UID = '26262626-2626-4262-8262-262626262626';
const DOCS_WIDGET_UID = '27272727-2727-4272-8272-272727272727';
const DASHBOARD_PAGE_LAYOUT_UID = '28282828-2828-4282-8282-282828282828';
const DASHBOARD_TAB_UID = '29292929-2929-4292-8292-292929292929';
const AGE_CHART_WIDGET_UID = '30303030-3030-4303-8303-303030303030';
const PET_RECORD_PAGE_EXTRA_TAB_UID = '31313131-3131-4313-8313-313131313131';
const PET_EXTRA_NOTES_WIDGET_UID = '32323232-3232-4323-8323-323232323232';
const COMPANY_TAGLINE_TAB_UID = '34343434-3434-4343-8343-343434343434';
const CARE_FOLDER_MENU_ITEM_UID = '35353535-3535-4353-8353-353535353535';
const PET_MENU_ITEM_UID = '36363636-3636-4363-8363-363636363636';
const HANDBOOK_MENU_ITEM_UID = '37373737-3737-4373-8373-373737373737';

const PET_RECORD_PAGE_LAYOUT_UID = getSystemRecordPageLayoutUniversalIdentifier(
  {
    objectMetadataApplicationUniversalIdentifier: APP_UID,
    objectUniversalIdentifier: PET_UID,
  },
);

const COMPANY_INDEX_VIEW_UID = getSystemViewUniversalIdentifier({
  objectMetadataApplicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company,
  viewKey: SYSTEM_VIEW_KEYS.INDEX,
});

const EXPORTED_TRANSLATIONS = {
  'fr-FR': {
    [generateMessageId('Pet', 'objectMetadata.labelSingular')]: 'Animal',
    zzzzzz: 'orphan',
  },
};

const EXPORTED_MANIFEST = {
  translations: EXPORTED_TRANSLATIONS,
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
              id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
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
    {
      universalIdentifier: JUNCTION_UID,
      nameSingular: 'petCareAgreement',
      namePlural: 'petCareAgreements',
      labelSingular: 'Pet care agreement',
      labelPlural: 'Pet care agreements',
      labelIdentifierFieldMetadataUniversalIdentifier:
        getFieldUniversalIdentifier({
          applicationUniversalIdentifier: APP_UID,
          objectUniversalIdentifier: JUNCTION_UID,
          name: 'id',
        }),
      fields: [
        {
          universalIdentifier: JUNCTION_PET_FIELD_UID,
          type: 'RELATION',
          name: 'pet',
          label: 'Pet',
          options: null,
          defaultValue: null,
          isUIEditable: true,
          writability: 'OPEN',
          isNullable: true,
          isUnique: false,
          isLabelSyncedWithName: false,
          relationTargetFieldMetadataUniversalIdentifier:
            PET_AGREEMENTS_FIELD_UID,
          relationTargetObjectMetadataUniversalIdentifier: PET_UID,
          universalSettings: {
            relationType: 'MANY_TO_ONE',
            onDelete: 'CASCADE',
            joinColumnName: 'petId',
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
  views: [
    {
      universalIdentifier: VIEW_UID,
      name: 'Senior pets',
      objectUniversalIdentifier: PET_UID,
      type: 'TABLE',
      icon: 'IconPaw',
      position: 1,
      isCompact: false,
      visibility: 'WORKSPACE',
      openRecordIn: 'SIDE_PANEL',
      mainGroupByFieldMetadataUniversalIdentifier: PET_STATUS_FIELD_UID,
      shouldHideEmptyGroups: false,
      anyFieldFilterValue: null,
      fields: [
        {
          universalIdentifier: VIEW_NAME_FIELD_UID,
          fieldMetadataUniversalIdentifier: PET_NAME_FIELD_UID,
          isVisible: true,
          size: 180,
          position: 0,
        },
        {
          universalIdentifier: VIEW_AGE_FIELD_UID,
          fieldMetadataUniversalIdentifier: PET_AGE_FIELD_UID,
          isVisible: true,
          size: 100,
          position: 1,
          aggregateOperation: 'AVG',
        },
      ],
      filterGroups: [
        {
          universalIdentifier: VIEW_FILTER_GROUP_UID,
          logicalOperator: 'NOT',
          positionInViewFilterGroup: 0,
        },
      ],
      filters: [
        {
          universalIdentifier: VIEW_FILTER_UID,
          fieldMetadataUniversalIdentifier: PET_NAME_FIELD_UID,
          operand: 'CONTAINS',
          value: 'Rex',
          viewFilterGroupUniversalIdentifier: VIEW_FILTER_GROUP_UID,
          positionInViewFilterGroup: 0,
        },
      ],
      sorts: [
        {
          universalIdentifier: VIEW_SORT_UID,
          fieldMetadataUniversalIdentifier: PET_AGE_FIELD_UID,
          direction: 'DESC',
        },
      ],
      groups: [
        {
          universalIdentifier: VIEW_GROUP_UID,
          fieldValue: 'HEALTHY',
          isVisible: true,
          position: 0,
        },
      ],
      fieldGroups: [
        {
          universalIdentifier: VIEW_FIELD_GROUP_UID,
          name: 'Details',
          position: 0,
          isVisible: true,
        },
      ],
    },
  ],
  viewFields: [
    {
      universalIdentifier: COMPANY_INDEX_VIEW_FIELD_UID,
      viewUniversalIdentifier: COMPANY_INDEX_VIEW_UID,
      fieldMetadataUniversalIdentifier: COMPANY_TAGLINE_FIELD_UID,
      isVisible: true,
      size: 150,
      position: 3,
    },
  ],
  navigationMenuItems: [
    {
      universalIdentifier: CARE_FOLDER_MENU_ITEM_UID,
      type: 'FOLDER',
      name: 'Care',
      position: 0,
    },
    {
      universalIdentifier: PET_MENU_ITEM_UID,
      type: 'OBJECT',
      position: 1,
      folderUniversalIdentifier: CARE_FOLDER_MENU_ITEM_UID,
      targetObjectUniversalIdentifier: PET_UID,
    },
    {
      universalIdentifier: HANDBOOK_MENU_ITEM_UID,
      type: 'LINK',
      name: 'Handbook',
      icon: 'IconBook',
      position: 2,
      link: 'https://example.com/handbook',
    },
  ],
  pageLayouts: [
    {
      universalIdentifier: PET_PAGE_LAYOUT_UID,
      name: 'Pet page',
      type: 'RECORD_PAGE',
      objectUniversalIdentifier: PET_UID,
      defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
        PET_OVERVIEW_TAB_UID,
      tabs: [
        {
          universalIdentifier: PET_OVERVIEW_TAB_UID,
          title: 'Overview',
          position: 0,
          icon: 'IconHome',
          layoutMode: 'VERTICAL_LIST',
          widgets: [
            {
              universalIdentifier: PET_FIELDS_WIDGET_UID,
              title: 'Fields',
              type: 'FIELDS',
              objectUniversalIdentifier: PET_UID,
              position: { layoutMode: 'VERTICAL_LIST', index: 0 },
              configuration: {
                configurationType: 'FIELDS',
                viewUniversalIdentifier: VIEW_UID,
                newFieldDefaultVisibility: true,
              },
            },
          ],
        },
      ],
    },
    {
      universalIdentifier: DOCS_PAGE_LAYOUT_UID,
      name: 'Pet docs',
      type: 'STANDALONE_PAGE',
      tabs: [
        {
          universalIdentifier: DOCS_TAB_UID,
          title: 'Docs',
          position: 0,
          layoutMode: 'GRID',
          widgets: [
            {
              universalIdentifier: DOCS_WIDGET_UID,
              title: 'Docs',
              type: 'IFRAME',
              position: {
                layoutMode: 'GRID',
                row: 0,
                column: 0,
                rowSpan: 4,
                columnSpan: 6,
              },
              configuration: {
                __typename: 'IframeConfiguration',
                configurationType: 'IFRAME',
                url: 'https://example.com/pets',
              },
            },
          ],
        },
      ],
    },
    {
      universalIdentifier: DASHBOARD_PAGE_LAYOUT_UID,
      name: 'Pet dashboard',
      type: 'DASHBOARD',
      tabs: [
        {
          universalIdentifier: DASHBOARD_TAB_UID,
          title: 'Charts',
          position: 0,
          layoutMode: 'GRID',
          widgets: [
            {
              universalIdentifier: AGE_CHART_WIDGET_UID,
              title: 'Age by status',
              type: 'GRAPH',
              objectUniversalIdentifier: PET_UID,
              position: {
                layoutMode: 'GRID',
                row: 0,
                column: 0,
                rowSpan: 6,
                columnSpan: 12,
              },
              configuration: {
                configurationType: 'BAR_CHART',
                aggregateFieldMetadataUniversalIdentifier: PET_AGE_FIELD_UID,
                aggregateOperation: 'AVG',
                primaryAxisGroupByFieldMetadataUniversalIdentifier:
                  PET_STATUS_FIELD_UID,
                primaryAxisDateGranularity: 'MONTH',
                secondaryAxisGroupByFieldMetadataUniversalIdentifier: null,
                filter: {
                  recordFilters: [
                    {
                      fieldMetadataUniversalIdentifier: PET_NAME_FIELD_UID,
                      operand: 'contains',
                      value: 'Rex',
                    },
                  ],
                },
              },
            },
          ],
        },
      ],
    },
  ],
  pageLayoutTabs: [
    {
      universalIdentifier: PET_RECORD_PAGE_EXTRA_TAB_UID,
      pageLayoutUniversalIdentifier: PET_RECORD_PAGE_LAYOUT_UID,
      title: 'Extra',
      position: 60,
      layoutMode: 'VERTICAL_LIST',
      widgets: [
        {
          universalIdentifier: PET_EXTRA_NOTES_WIDGET_UID,
          title: 'Notes',
          type: 'NOTES',
          objectUniversalIdentifier: PET_UID,
          position: { layoutMode: 'VERTICAL_LIST', index: 0 },
          configuration: { configurationType: 'NOTES' },
        },
      ],
    },
    {
      universalIdentifier: COMPANY_TAGLINE_TAB_UID,
      pageLayoutUniversalIdentifier:
        STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage
          .universalIdentifier,
      title: 'Tagline',
      position: 60,
      layoutMode: 'VERTICAL_LIST',
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

    const translationPlan = await planTranslationWrites({
      appPath,
      manifest: EXPORTED_MANIFEST,
      baseManifest: null,
      frontComponentSourcePaths: [],
    });

    for (const write of translationPlan.writes) {
      const filePath = join(appPath, write.relativePath);

      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, write.content);
    }

    const buildResult = await buildManifest(appPath);

    builtManifest = buildResult.manifest;
    buildErrors = buildResult.errors;
  }, 60000);

  afterAll(async () => {
    await rm(appPath, { recursive: true, force: true });
  });

  it('should rebuild the exported translations from the written locale files', async () => {
    expect(
      JSON.parse(await readFile(join(appPath, 'locales/fr-FR.json'), 'utf8')),
    ).toEqual({ 'objectMetadata.labelSingular': { Pet: 'Animal' } });
    expect(
      JSON.parse(
        await readFile(join(appPath, 'locales/compiled/fr-FR.json'), 'utf8'),
      ),
    ).toEqual({ zzzzzz: 'orphan' });
    expect(await compileApplicationTranslations(appPath)).toEqual(
      EXPORTED_TRANSLATIONS,
    );
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

  it('should rebuild the exported view with its fields, filters, groups and sorts in order', () => {
    expect(
      canonicalize(sortByUniversalIdentifier(builtManifest?.views ?? [])),
    ).toEqual(canonicalize(sortByUniversalIdentifier(EXPORTED_MANIFEST.views)));
  });

  it('should rebuild the standalone view field on the company index view unchanged', () => {
    expect(
      canonicalize(sortByUniversalIdentifier(builtManifest?.viewFields ?? [])),
    ).toEqual(
      canonicalize(sortByUniversalIdentifier(EXPORTED_MANIFEST.viewFields)),
    );
  });

  it('should rebuild the exported navigation menu items, including the nameless object item nested in its folder', () => {
    expect(
      canonicalize(
        sortByUniversalIdentifier(builtManifest?.navigationMenuItems ?? []),
      ),
    ).toEqual(
      canonicalize(
        sortByUniversalIdentifier(EXPORTED_MANIFEST.navigationMenuItems),
      ),
    );
  });

  it('should rebuild the exported page layouts with their tabs and widgets in order, without the GraphQL typename a UI-saved widget carries', () => {
    expect(
      canonicalize(sortByUniversalIdentifier(builtManifest?.pageLayouts ?? [])),
    ).toEqual(
      canonicalize(
        sortByUniversalIdentifier(
          stripGraphqlTypename(EXPORTED_MANIFEST.pageLayouts),
        ),
      ),
    );
    expect(JSON.stringify(builtManifest?.pageLayouts)).not.toContain(
      '__typename',
    );
  });

  it('should rebuild the standalone tabs on the pet record page and the company record page unchanged', () => {
    expect(
      canonicalize(
        sortByUniversalIdentifier(builtManifest?.pageLayoutTabs ?? []),
      ),
    ).toEqual(
      canonicalize(sortByUniversalIdentifier(EXPORTED_MANIFEST.pageLayoutTabs)),
    );
  });

  it('should keep a junction object without adding a name field to it', () => {
    const junctionObject = (builtManifest?.objects ?? []).find(
      (objectManifest) => objectManifest.universalIdentifier === JUNCTION_UID,
    );

    expect(junctionObject?.fields.map((field) => field.name)).toEqual(['pet']);
    expect(
      junctionObject?.labelIdentifierFieldMetadataUniversalIdentifier,
    ).toBe(
      getFieldUniversalIdentifier({
        applicationUniversalIdentifier: APP_UID,
        objectUniversalIdentifier: JUNCTION_UID,
        name: 'id',
      }),
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
