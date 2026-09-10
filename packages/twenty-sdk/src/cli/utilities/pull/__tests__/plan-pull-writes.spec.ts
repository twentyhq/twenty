import { ManifestEntityKey } from '@/cli/utilities/build/manifest/manifest-extract-config';
import { planPullWrites } from '@/cli/utilities/pull/plan-pull-writes';
import { type ScannedDefineFile } from '@/cli/utilities/pull/scan-project-define-files';
import {
  type Manifest,
  type PageLayoutManifest,
  type PageLayoutTabManifest,
  type StandaloneViewFieldManifest,
  type ViewFilterManifest,
  type ViewManifest,
} from 'twenty-shared/application';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import {
  PageLayoutTabLayoutMode,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { describe, expect, it } from 'vitest';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const PET_UID = '22222222-2222-4222-8222-222222222222';
const NAME_FIELD_UID = '33333333-3333-4333-8333-333333333333';
const ROCKET_UID = '44444444-4444-4444-8444-444444444444';
const ROCKET_NAME_FIELD_UID = '55555555-5555-4555-8555-555555555555';
const JUNCTION_UID = '66666666-6666-4666-8666-666666666666';
const JUNCTION_ID_FIELD_UID = '77777777-7777-4777-8777-777777777777';
const ALL_PETS_VIEW_UID = '88888888-8888-4888-8888-888888888888';
const HEALTHY_PETS_VIEW_UID = '99999999-9999-4999-8999-999999999999';
const OVERVIEW_VIEW_UID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const SECOND_OVERVIEW_VIEW_UID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const THIRD_OVERVIEW_VIEW_UID = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
const HEALTHY_PETS_FILTER_UID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const PET_NAME_VIEW_FIELD_UID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const ROCKET_NAME_VIEW_FIELD_UID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const PET_PAGE_LAYOUT_UID = '12121212-1212-4121-8121-121212121212';
const ROCKET_PAGE_LAYOUT_UID = '13131313-1313-4131-8131-131313131313';
const SECOND_PET_PAGE_LAYOUT_UID = '14141414-1414-4141-8141-141414141414';
const COMPANY_EXTRA_TAB_UID = '15151515-1515-4151-8151-151515151515';
const PERSON_EXTRA_TAB_UID = '16161616-1616-4161-8161-161616161616';
const DOCS_WIDGET_UID = '17171717-1717-4171-8171-171717171717';

const buildObject = ({
  universalIdentifier,
  nameSingular,
  labelIdentifierFieldMetadataUniversalIdentifier,
  label = 'Name',
}: {
  universalIdentifier: string;
  nameSingular: string;
  labelIdentifierFieldMetadataUniversalIdentifier: string;
  label?: string;
}) => ({
  universalIdentifier,
  nameSingular,
  namePlural: `${nameSingular}s`,
  labelSingular: nameSingular,
  labelPlural: `${nameSingular}s`,
  labelIdentifierFieldMetadataUniversalIdentifier,
  fields: [
    {
      universalIdentifier: labelIdentifierFieldMetadataUniversalIdentifier,
      name: 'name',
      label,
      type: 'TEXT',
    },
  ],
});

const buildManifest = (objects: unknown[]): Manifest =>
  ({
    application: {
      universalIdentifier: APP_UID,
      displayName: 'Pets',
      description: '',
      defaultRoleUniversalIdentifier: 'role-uid',
    },
    objects,
    fields: [],
    indexes: [],
  }) as unknown as Manifest;

const MANIFEST = buildManifest([
  buildObject({
    universalIdentifier: PET_UID,
    nameSingular: 'pet',
    labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UID,
  }),
]);

const buildView = (
  overrides: Partial<ViewManifest> & { universalIdentifier: string },
): ViewManifest => ({
  name: 'Overview',
  objectUniversalIdentifier: PET_UID,
  ...overrides,
});

const buildViewField = (
  overrides: Partial<StandaloneViewFieldManifest> & {
    universalIdentifier: string;
  },
): StandaloneViewFieldManifest => ({
  viewUniversalIdentifier: OVERVIEW_VIEW_UID,
  fieldMetadataUniversalIdentifier: NAME_FIELD_UID,
  position: 0,
  ...overrides,
});

const buildPageLayout = (
  overrides: Partial<PageLayoutManifest> & { universalIdentifier: string },
): PageLayoutManifest => ({
  name: 'Overview',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: PET_UID,
  ...overrides,
});

const buildPageLayoutTab = (
  overrides: Partial<PageLayoutTabManifest> & { universalIdentifier: string },
): PageLayoutTabManifest => ({
  pageLayoutUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage
      .universalIdentifier,
  title: 'Extra',
  position: 60,
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  ...overrides,
});

const buildManifestWithDocsPageLayout = (url: string): Manifest => ({
  ...buildManifest([
    buildObject({
      universalIdentifier: PET_UID,
      nameSingular: 'pet',
      labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UID,
    }),
    buildObject({
      universalIdentifier: ROCKET_UID,
      nameSingular: 'rocket',
      labelIdentifierFieldMetadataUniversalIdentifier: ROCKET_NAME_FIELD_UID,
    }),
  ]),
  pageLayouts: [
    buildPageLayout({
      universalIdentifier: ROCKET_PAGE_LAYOUT_UID,
      name: 'Board',
      objectUniversalIdentifier: ROCKET_UID,
    }),
    buildPageLayout({
      universalIdentifier: PET_PAGE_LAYOUT_UID,
      tabs: [
        {
          universalIdentifier: COMPANY_EXTRA_TAB_UID,
          title: 'Docs',
          position: 0,
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          widgets: [
            {
              universalIdentifier: DOCS_WIDGET_UID,
              title: 'Docs',
              type: 'IFRAME',
              position: {
                layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                index: 0,
              },
              configuration: { configurationType: 'IFRAME', url },
            },
          ],
        },
      ],
    }),
  ],
});

const buildNameFilter = (value: string): ViewFilterManifest => ({
  universalIdentifier: HEALTHY_PETS_FILTER_UID,
  fieldMetadataUniversalIdentifier: NAME_FIELD_UID,
  operand: ViewFilterOperand.IS,
  value,
});

const buildManifestWithFilteredView = (filterValue: string): Manifest => ({
  ...MANIFEST,
  views: [
    buildView({ universalIdentifier: ALL_PETS_VIEW_UID, name: 'All pets' }),
    buildView({
      universalIdentifier: HEALTHY_PETS_VIEW_UID,
      name: 'Healthy pets',
      filters: [buildNameFilter(filterValue)],
    }),
  ],
});

describe('planPullWrites', () => {
  it('should write every entity when the project has no source and no base', () => {
    const plan = planPullWrites({
      manifest: MANIFEST,
      baseManifest: null,
      scannedFiles: [],
    });

    expect(plan.writes.map((write) => write.relativePath)).toEqual([
      'src/application.config.ts',
      'src/objects/pet.object.ts',
    ]);
    expect(plan.writes.every((write) => !write.isRegeneration)).toBe(true);
    expect(plan.deletions).toEqual([]);
  });

  it('should regenerate the application config in the file that already declares one', () => {
    const scannedFiles: ScannedDefineFile[] = [
      {
        relativePath: 'src/application-config.ts',
        entityKey: ManifestEntityKey.Application,
        universalIdentifier: 'a-placeholder-identifier',
        isReadable: true,
      },
    ];

    const plan = planPullWrites({
      manifest: MANIFEST,
      baseManifest: null,
      scannedFiles,
    });
    const applicationWrite = plan.writes.find(
      (write) => write.kind === 'application',
    );

    expect(applicationWrite?.relativePath).toBe('src/application-config.ts');
    expect(applicationWrite?.isRegeneration).toBe(true);
  });

  it('should leave a file untouched when its entity has not changed since the base', () => {
    const scannedFiles: ScannedDefineFile[] = [
      {
        relativePath: 'src/application.config.ts',
        entityKey: ManifestEntityKey.Application,
        universalIdentifier: APP_UID,
        isReadable: true,
      },
      {
        relativePath: 'src/objects/pet.object.ts',
        entityKey: ManifestEntityKey.Objects,
        universalIdentifier: PET_UID,
        isReadable: true,
      },
    ];

    const plan = planPullWrites({
      manifest: MANIFEST,
      baseManifest: MANIFEST,
      scannedFiles,
    });

    expect(plan.writes).toEqual([]);
    expect(plan.unchanged).toHaveLength(2);
  });

  it('should rewrite only the entity that changed on the server', () => {
    const scannedFiles: ScannedDefineFile[] = [
      {
        relativePath: 'src/application.config.ts',
        entityKey: ManifestEntityKey.Application,
        universalIdentifier: APP_UID,
        isReadable: true,
      },
      {
        relativePath: 'src/objects/pet.object.ts',
        entityKey: ManifestEntityKey.Objects,
        universalIdentifier: PET_UID,
        isReadable: true,
      },
    ];

    const plan = planPullWrites({
      manifest: buildManifest([
        buildObject({
          universalIdentifier: PET_UID,
          nameSingular: 'pet',
          labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UID,
          label: 'Renamed on the server',
        }),
      ]),
      baseManifest: MANIFEST,
      scannedFiles,
    });

    expect(plan.writes.map((write) => write.relativePath)).toEqual([
      'src/objects/pet.object.ts',
    ]);
    expect(plan.writes[0].isRegeneration).toBe(true);
    expect(plan.writes[0].content).toContain('Renamed on the server');
  });

  it('should delete the file of an entity the base knew and the workspace no longer has', () => {
    const scannedFiles: ScannedDefineFile[] = [
      {
        relativePath: 'src/objects/rocket.object.ts',
        entityKey: ManifestEntityKey.Objects,
        universalIdentifier: ROCKET_UID,
        isReadable: true,
      },
    ];

    const plan = planPullWrites({
      manifest: MANIFEST,
      baseManifest: buildManifest([
        buildObject({
          universalIdentifier: PET_UID,
          nameSingular: 'pet',
          labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UID,
        }),
        buildObject({
          universalIdentifier: ROCKET_UID,
          nameSingular: 'rocket',
          labelIdentifierFieldMetadataUniversalIdentifier:
            ROCKET_NAME_FIELD_UID,
        }),
      ]),
      scannedFiles,
    });

    expect(plan.deletions).toEqual([
      {
        universalIdentifier: ROCKET_UID,
        relativePath: 'src/objects/rocket.object.ts',
      },
    ]);
  });

  it('should report a local entity that neither the workspace nor the base knows', () => {
    const scannedFiles: ScannedDefineFile[] = [
      {
        relativePath: 'src/objects/unpushed.object.ts',
        entityKey: ManifestEntityKey.Objects,
        universalIdentifier: 'an-unpushed-identifier',
        isReadable: true,
      },
    ];

    const plan = planPullWrites({
      manifest: MANIFEST,
      baseManifest: null,
      scannedFiles,
    });

    expect(plan.localOnlyRelativePaths).toEqual([
      'src/objects/unpushed.object.ts',
    ]);
    expect(plan.deletions).toEqual([]);
  });

  it('should place a new entity beside existing files of its kind', () => {
    const scannedFiles: ScannedDefineFile[] = [
      {
        relativePath: 'app/data-model/rocket.object.ts',
        entityKey: ManifestEntityKey.Objects,
        universalIdentifier: ROCKET_UID,
        isReadable: true,
      },
    ];

    const plan = planPullWrites({
      manifest: MANIFEST,
      baseManifest: null,
      scannedFiles,
    });

    expect(
      plan.writes.find((write) => write.kind === 'object')?.relativePath,
    ).toBe('app/data-model/pet.object.ts');
  });

  it('should qualify colliding file names with the name of each parent object', () => {
    const plan = planPullWrites({
      manifest: {
        ...MANIFEST,
        objects: [
          buildObject({
            universalIdentifier: PET_UID,
            nameSingular: 'pet',
            labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UID,
          }),
          buildObject({
            universalIdentifier: ROCKET_UID,
            nameSingular: 'rocket',
            labelIdentifierFieldMetadataUniversalIdentifier:
              ROCKET_NAME_FIELD_UID,
          }),
        ],
        fields: [
          {
            universalIdentifier: 'field-one',
            name: 'notes',
            label: 'Notes',
            type: 'TEXT',
            objectUniversalIdentifier: PET_UID,
          },
          {
            universalIdentifier: 'field-two',
            name: 'notes',
            label: 'Notes',
            type: 'TEXT',
            objectUniversalIdentifier: ROCKET_UID,
          },
        ],
      } as unknown as Manifest,
      baseManifest: null,
      scannedFiles: [],
    });

    expect(
      plan.writes
        .filter((write) => write.kind === 'field')
        .map((write) => write.relativePath)
        .sort(),
    ).toEqual([
      'src/fields/pet-notes.field.ts',
      'src/fields/rocket-notes.field.ts',
    ]);
  });

  it('should never write over a file that belongs to another entity', () => {
    const plan = planPullWrites({
      manifest: MANIFEST,
      baseManifest: null,
      scannedFiles: [
        {
          relativePath: 'src/objects/pet.object.ts',
          entityKey: ManifestEntityKey.Objects,
          universalIdentifier: 'a-different-identifier',
          isReadable: true,
        },
      ],
    });

    const objectWrite = plan.writes.find((write) => write.kind === 'object');

    expect(objectWrite?.relativePath).not.toBe('src/objects/pet.object.ts');
    expect(objectWrite?.relativePath).toBe(
      `src/objects/${PET_UID.slice(0, 8)}-pet.object.ts`,
    );
  });

  it('should not claim a path that differs only by case', () => {
    const plan = planPullWrites({
      manifest: MANIFEST,
      baseManifest: null,
      scannedFiles: [
        {
          relativePath: 'src/objects/Pet.object.ts',
          entityKey: ManifestEntityKey.Objects,
          universalIdentifier: 'a-different-identifier',
          isReadable: true,
        },
      ],
    });

    expect(
      plan.writes
        .find((write) => write.kind === 'object')
        ?.relativePath.toLowerCase(),
    ).not.toBe('src/objects/pet.object.ts');
  });

  it('should keep a file whose define file could not be read', () => {
    const plan = planPullWrites({
      manifest: MANIFEST,
      baseManifest: null,
      scannedFiles: [
        {
          relativePath: 'src/objects/pet.object.ts',
          entityKey: null,
          universalIdentifier: null,
          isReadable: false,
        },
      ],
    });

    expect(plan.writes.map((write) => write.relativePath)).not.toContain(
      'src/objects/pet.object.ts',
    );
  });

  it('should place a new view beside existing view files', () => {
    const plan = planPullWrites({
      manifest: {
        ...MANIFEST,
        views: [
          buildView({ universalIdentifier: OVERVIEW_VIEW_UID }),
          buildView({
            universalIdentifier: ALL_PETS_VIEW_UID,
            name: 'All pets',
          }),
        ],
      },
      baseManifest: null,
      scannedFiles: [
        {
          relativePath: 'app/screens/overview.view.ts',
          entityKey: ManifestEntityKey.Views,
          universalIdentifier: OVERVIEW_VIEW_UID,
          isReadable: true,
        },
      ],
    });

    expect(
      plan.writes.find(
        (write) => write.universalIdentifier === ALL_PETS_VIEW_UID,
      )?.relativePath,
    ).toBe('app/screens/all-pets.view.ts');
  });

  it('should place a new standalone view field beside existing view field files', () => {
    const plan = planPullWrites({
      manifest: {
        ...buildManifest([
          buildObject({
            universalIdentifier: PET_UID,
            nameSingular: 'pet',
            labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UID,
          }),
          buildObject({
            universalIdentifier: ROCKET_UID,
            nameSingular: 'rocket',
            labelIdentifierFieldMetadataUniversalIdentifier:
              ROCKET_NAME_FIELD_UID,
          }),
        ]),
        views: [buildView({ universalIdentifier: OVERVIEW_VIEW_UID })],
        viewFields: [
          buildViewField({
            universalIdentifier: ROCKET_NAME_VIEW_FIELD_UID,
            fieldMetadataUniversalIdentifier: ROCKET_NAME_FIELD_UID,
          }),
          buildViewField({ universalIdentifier: PET_NAME_VIEW_FIELD_UID }),
        ],
      },
      baseManifest: null,
      scannedFiles: [
        {
          relativePath: 'app/screens/overview.view.ts',
          entityKey: ManifestEntityKey.Views,
          universalIdentifier: OVERVIEW_VIEW_UID,
          isReadable: true,
        },
        {
          relativePath: 'app/screens/columns/rocket-name.view-field.ts',
          entityKey: ManifestEntityKey.ViewFields,
          universalIdentifier: ROCKET_NAME_VIEW_FIELD_UID,
          isReadable: true,
        },
      ],
    });

    expect(
      plan.writes.find(
        (write) => write.universalIdentifier === PET_NAME_VIEW_FIELD_UID,
      )?.relativePath,
    ).toBe('app/screens/columns/pet-name.view-field.ts');
  });

  it('should qualify colliding view file names with the kebab-cased name of each object', () => {
    const plan = planPullWrites({
      manifest: {
        ...buildManifest([
          buildObject({
            universalIdentifier: JUNCTION_UID,
            nameSingular: 'petCareAgreement',
            labelIdentifierFieldMetadataUniversalIdentifier:
              JUNCTION_ID_FIELD_UID,
          }),
          buildObject({
            universalIdentifier: ROCKET_UID,
            nameSingular: 'rocket',
            labelIdentifierFieldMetadataUniversalIdentifier:
              ROCKET_NAME_FIELD_UID,
          }),
        ]),
        views: [
          buildView({
            universalIdentifier: OVERVIEW_VIEW_UID,
            objectUniversalIdentifier: JUNCTION_UID,
          }),
          buildView({
            universalIdentifier: SECOND_OVERVIEW_VIEW_UID,
            objectUniversalIdentifier: ROCKET_UID,
          }),
        ],
      },
      baseManifest: null,
      scannedFiles: [],
    });

    expect(
      plan.writes
        .filter((write) => write.kind === 'view')
        .map((write) => write.relativePath)
        .sort(),
    ).toEqual([
      'src/views/pet-care-agreement-overview.view.ts',
      'src/views/rocket-overview.view.ts',
    ]);
  });

  it('should fall back to identifier-prefixed names when two views of one object share a name', () => {
    const plan = planPullWrites({
      manifest: {
        ...MANIFEST,
        views: [
          buildView({ universalIdentifier: OVERVIEW_VIEW_UID }),
          buildView({ universalIdentifier: SECOND_OVERVIEW_VIEW_UID }),
        ],
      },
      baseManifest: null,
      scannedFiles: [],
    });

    expect(
      plan.writes
        .filter((write) => write.kind === 'view')
        .map((write) => write.relativePath)
        .sort(),
    ).toEqual([
      `src/views/${OVERVIEW_VIEW_UID.slice(0, 8)}-pet-overview.view.ts`,
      `src/views/${SECOND_OVERVIEW_VIEW_UID.slice(0, 8)}-pet-overview.view.ts`,
    ]);
  });

  it('should prefix only the views whose qualified names still collide', () => {
    const plan = planPullWrites({
      manifest: {
        ...buildManifest([
          buildObject({
            universalIdentifier: PET_UID,
            nameSingular: 'pet',
            labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UID,
          }),
          buildObject({
            universalIdentifier: ROCKET_UID,
            nameSingular: 'rocket',
            labelIdentifierFieldMetadataUniversalIdentifier:
              ROCKET_NAME_FIELD_UID,
          }),
        ]),
        views: [
          buildView({ universalIdentifier: OVERVIEW_VIEW_UID }),
          buildView({ universalIdentifier: SECOND_OVERVIEW_VIEW_UID }),
          buildView({
            universalIdentifier: THIRD_OVERVIEW_VIEW_UID,
            objectUniversalIdentifier: ROCKET_UID,
          }),
        ],
      },
      baseManifest: null,
      scannedFiles: [],
    });

    expect(
      plan.writes
        .filter((write) => write.kind === 'view')
        .map((write) => write.relativePath)
        .sort(),
    ).toEqual([
      `src/views/${OVERVIEW_VIEW_UID.slice(0, 8)}-pet-overview.view.ts`,
      `src/views/${SECOND_OVERVIEW_VIEW_UID.slice(0, 8)}-pet-overview.view.ts`,
      'src/views/rocket-overview.view.ts',
    ]);
  });

  it('should keep a qualified file name within the length cap', () => {
    const longName = 'x'.repeat(100);
    const plan = planPullWrites({
      manifest: {
        ...buildManifest([
          buildObject({
            universalIdentifier: PET_UID,
            nameSingular: 'pet',
            labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UID,
          }),
          buildObject({
            universalIdentifier: ROCKET_UID,
            nameSingular: 'rocket',
            labelIdentifierFieldMetadataUniversalIdentifier:
              ROCKET_NAME_FIELD_UID,
          }),
        ]),
        views: [
          buildView({ universalIdentifier: OVERVIEW_VIEW_UID, name: longName }),
          buildView({
            universalIdentifier: SECOND_OVERVIEW_VIEW_UID,
            name: longName,
            objectUniversalIdentifier: ROCKET_UID,
          }),
        ],
      },
      baseManifest: null,
      scannedFiles: [],
    });

    expect(
      plan.writes
        .filter((write) => write.kind === 'view')
        .map((write) => write.relativePath)
        .sort(),
    ).toEqual([
      `src/views/pet-${'x'.repeat(76)}.view.ts`,
      `src/views/rocket-${'x'.repeat(73)}.view.ts`,
    ]);
  });

  it('should leave an unchanged view untouched and regenerate the view whose filter changed on the server', () => {
    const scannedFiles: ScannedDefineFile[] = [
      {
        relativePath: 'src/application.config.ts',
        entityKey: ManifestEntityKey.Application,
        universalIdentifier: APP_UID,
        isReadable: true,
      },
      {
        relativePath: 'src/objects/pet.object.ts',
        entityKey: ManifestEntityKey.Objects,
        universalIdentifier: PET_UID,
        isReadable: true,
      },
      {
        relativePath: 'src/views/all-pets.view.ts',
        entityKey: ManifestEntityKey.Views,
        universalIdentifier: ALL_PETS_VIEW_UID,
        isReadable: true,
      },
      {
        relativePath: 'src/views/healthy-pets.view.ts',
        entityKey: ManifestEntityKey.Views,
        universalIdentifier: HEALTHY_PETS_VIEW_UID,
        isReadable: true,
      },
    ];

    const plan = planPullWrites({
      manifest: buildManifestWithFilteredView('Max'),
      baseManifest: buildManifestWithFilteredView('Rex'),
      scannedFiles,
    });

    expect(
      plan.unchanged.map((entity) => entity.universalIdentifier),
    ).toContain(ALL_PETS_VIEW_UID);
    expect(plan.writes.map((write) => write.relativePath)).toEqual([
      'src/views/healthy-pets.view.ts',
    ]);
    expect(plan.writes[0].isRegeneration).toBe(true);
    expect(plan.writes[0].content).toContain("value: 'Max',");
    expect(plan.writes[0].content).toContain('operand: ViewFilterOperand.IS,');
  });

  it('should place a new page layout beside existing page layout files', () => {
    const plan = planPullWrites({
      manifest: {
        ...MANIFEST,
        pageLayouts: [
          buildPageLayout({ universalIdentifier: ROCKET_PAGE_LAYOUT_UID }),
          buildPageLayout({
            universalIdentifier: PET_PAGE_LAYOUT_UID,
            name: 'Pet page',
          }),
        ],
      },
      baseManifest: null,
      scannedFiles: [
        {
          relativePath: 'app/screens/overview.page-layout.ts',
          entityKey: ManifestEntityKey.PageLayouts,
          universalIdentifier: ROCKET_PAGE_LAYOUT_UID,
          isReadable: true,
        },
      ],
    });

    expect(
      plan.writes.find(
        (write) => write.universalIdentifier === PET_PAGE_LAYOUT_UID,
      )?.relativePath,
    ).toBe('app/screens/pet-page.page-layout.ts');
  });

  it('should place a new standalone page layout tab beside existing page layout tab files', () => {
    const plan = planPullWrites({
      manifest: {
        ...MANIFEST,
        pageLayoutTabs: [
          buildPageLayoutTab({ universalIdentifier: COMPANY_EXTRA_TAB_UID }),
          buildPageLayoutTab({
            universalIdentifier: PERSON_EXTRA_TAB_UID,
            pageLayoutUniversalIdentifier:
              STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage
                .universalIdentifier,
            title: 'Insights',
          }),
        ],
      },
      baseManifest: null,
      scannedFiles: [
        {
          relativePath: 'app/screens/tabs/extra.page-layout-tab.ts',
          entityKey: ManifestEntityKey.PageLayoutTabs,
          universalIdentifier: COMPANY_EXTRA_TAB_UID,
          isReadable: true,
        },
      ],
    });

    expect(
      plan.writes.find(
        (write) => write.universalIdentifier === PERSON_EXTRA_TAB_UID,
      )?.relativePath,
    ).toBe('app/screens/tabs/insights.page-layout-tab.ts');
  });

  it('should qualify colliding page layout file names with the kebab-cased name of each object', () => {
    const plan = planPullWrites({
      manifest: {
        ...buildManifest([
          buildObject({
            universalIdentifier: JUNCTION_UID,
            nameSingular: 'petCareAgreement',
            labelIdentifierFieldMetadataUniversalIdentifier:
              JUNCTION_ID_FIELD_UID,
          }),
          buildObject({
            universalIdentifier: ROCKET_UID,
            nameSingular: 'rocket',
            labelIdentifierFieldMetadataUniversalIdentifier:
              ROCKET_NAME_FIELD_UID,
          }),
        ]),
        pageLayouts: [
          buildPageLayout({
            universalIdentifier: PET_PAGE_LAYOUT_UID,
            objectUniversalIdentifier: JUNCTION_UID,
          }),
          buildPageLayout({
            universalIdentifier: ROCKET_PAGE_LAYOUT_UID,
            objectUniversalIdentifier: ROCKET_UID,
          }),
        ],
      },
      baseManifest: null,
      scannedFiles: [],
    });

    expect(
      plan.writes
        .filter((write) => write.kind === 'pageLayout')
        .map((write) => write.relativePath)
        .sort(),
    ).toEqual([
      'src/page-layouts/pet-care-agreement-overview.page-layout.ts',
      'src/page-layouts/rocket-overview.page-layout.ts',
    ]);
  });

  it('should qualify colliding standalone tab file names with the kebab-cased name of each page layout', () => {
    const plan = planPullWrites({
      manifest: {
        ...MANIFEST,
        pageLayoutTabs: [
          buildPageLayoutTab({ universalIdentifier: COMPANY_EXTRA_TAB_UID }),
          buildPageLayoutTab({
            universalIdentifier: PERSON_EXTRA_TAB_UID,
            pageLayoutUniversalIdentifier:
              STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage
                .universalIdentifier,
          }),
        ],
      },
      baseManifest: null,
      scannedFiles: [],
    });

    expect(
      plan.writes
        .filter((write) => write.kind === 'pageLayoutTab')
        .map((write) => write.relativePath)
        .sort(),
    ).toEqual([
      'src/page-layout-tabs/company-record-page-extra.page-layout-tab.ts',
      'src/page-layout-tabs/person-record-page-extra.page-layout-tab.ts',
    ]);
  });

  it('should fall back to identifier-prefixed names when two page layouts of one object share a name', () => {
    const plan = planPullWrites({
      manifest: {
        ...MANIFEST,
        pageLayouts: [
          buildPageLayout({ universalIdentifier: PET_PAGE_LAYOUT_UID }),
          buildPageLayout({ universalIdentifier: SECOND_PET_PAGE_LAYOUT_UID }),
        ],
      },
      baseManifest: null,
      scannedFiles: [],
    });

    expect(
      plan.writes
        .filter((write) => write.kind === 'pageLayout')
        .map((write) => write.relativePath)
        .sort(),
    ).toEqual([
      `src/page-layouts/${PET_PAGE_LAYOUT_UID.slice(0, 8)}-pet-overview.page-layout.ts`,
      `src/page-layouts/${SECOND_PET_PAGE_LAYOUT_UID.slice(0, 8)}-pet-overview.page-layout.ts`,
    ]);
  });

  it('should leave an unchanged page layout untouched and regenerate the page layout whose widget changed on the server', () => {
    const scannedFiles: ScannedDefineFile[] = [
      {
        relativePath: 'src/application.config.ts',
        entityKey: ManifestEntityKey.Application,
        universalIdentifier: APP_UID,
        isReadable: true,
      },
      {
        relativePath: 'src/objects/pet.object.ts',
        entityKey: ManifestEntityKey.Objects,
        universalIdentifier: PET_UID,
        isReadable: true,
      },
      {
        relativePath: 'src/objects/rocket.object.ts',
        entityKey: ManifestEntityKey.Objects,
        universalIdentifier: ROCKET_UID,
        isReadable: true,
      },
      {
        relativePath: 'src/page-layouts/board.page-layout.ts',
        entityKey: ManifestEntityKey.PageLayouts,
        universalIdentifier: ROCKET_PAGE_LAYOUT_UID,
        isReadable: true,
      },
      {
        relativePath: 'src/page-layouts/overview.page-layout.ts',
        entityKey: ManifestEntityKey.PageLayouts,
        universalIdentifier: PET_PAGE_LAYOUT_UID,
        isReadable: true,
      },
    ];

    const plan = planPullWrites({
      manifest: buildManifestWithDocsPageLayout('https://example.com/new'),
      baseManifest: buildManifestWithDocsPageLayout('https://example.com/old'),
      scannedFiles,
    });

    expect(
      plan.unchanged.map((entity) => entity.universalIdentifier),
    ).toContain(ROCKET_PAGE_LAYOUT_UID);
    expect(plan.writes.map((write) => write.relativePath)).toEqual([
      'src/page-layouts/overview.page-layout.ts',
    ]);
    expect(plan.writes[0].isRegeneration).toBe(true);
    expect(plan.writes[0].content).toContain("url: 'https://example.com/new',");
    expect(plan.writes[0].content).toContain(
      'layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,',
    );
    expect(plan.writes[0].content).toContain('type: WidgetType.IFRAME,');
  });
});
