import { buildPullEntities } from '@/cli/utilities/pull/build-pull-entities';
import {
  NAVIGATION_MENU_ITEM_ENUM_BINDINGS,
  PAGE_LAYOUT_ENUM_BINDINGS,
  PAGE_LAYOUT_TAB_ENUM_BINDINGS,
  VIEW_ENUM_BINDINGS,
  VIEW_FIELD_ENUM_BINDINGS,
} from '@/cli/utilities/pull/write-define-file';
import {
  getSystemRecordPageLayoutUniversalIdentifier,
  getSystemViewUniversalIdentifier,
  type Manifest,
  type NavigationMenuItemManifest,
  type PageLayoutManifest,
  type PageLayoutTabManifest,
  type StandaloneViewFieldManifest,
  SYSTEM_VIEW_KEYS,
  type ViewManifest,
} from 'twenty-shared/application';
import {
  STANDARD_OBJECT_FIELDS,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import {
  AggregateOperations,
  NavigationMenuItemType,
  PageLayoutTabLayoutMode,
  ViewSortDirection,
  ViewType,
} from 'twenty-shared/types';
import { describe, expect, it } from 'vitest';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const PET_UID = '22222222-2222-4222-8222-222222222222';
const PET_NAME_FIELD_UID = '33333333-3333-4333-8333-333333333333';
const COMPANY_FIELD_UID = '44444444-4444-4444-8444-444444444444';
const INDEX_UID = '55555555-5555-4555-8555-555555555555';
const JUNCTION_UID = '66666666-6666-4666-8666-666666666666';
const JUNCTION_ID_FIELD_UID = '77777777-7777-4777-8777-777777777777';
const VIEW_UID = '88888888-8888-4888-8888-888888888888';
const VIEW_FIELD_UID = '99999999-9999-4999-8999-999999999999';
const VIEW_SORT_UID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const INLINE_VIEW_FIELD_UID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const PAGE_LAYOUT_UID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const PAGE_LAYOUT_TAB_UID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const WIDGET_UID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const STANDALONE_TAB_UID = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
const NAVIGATION_MENU_ITEM_UID = '10101010-1010-4010-8010-101010101010';
const NAVIGATION_FOLDER_UID = '20202020-2020-4020-8020-202020202020';

const buildManifest = (overrides: Partial<Manifest> = {}): Manifest =>
  ({
    application: {
      universalIdentifier: APP_UID,
      displayName: 'Pets',
      description: 'Pet tracking',
      defaultRoleUniversalIdentifier: 'role-uid',
      packageJsonChecksum: 'package-checksum',
      yarnLockChecksum: 'lock-checksum',
    },
    objects: [
      {
        universalIdentifier: PET_UID,
        nameSingular: 'pet',
        namePlural: 'pets',
        labelSingular: 'Pet',
        labelPlural: 'Pets',
        labelIdentifierFieldMetadataUniversalIdentifier: PET_NAME_FIELD_UID,
        fields: [
          {
            universalIdentifier: PET_NAME_FIELD_UID,
            name: 'name',
            label: 'Name',
            type: 'TEXT',
            writability: 'OPEN',
          },
        ],
      },
    ],
    fields: [
      {
        universalIdentifier: COMPANY_FIELD_UID,
        name: 'caredForPets',
        label: 'Cared for pets',
        type: 'TEXT',
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company,
      },
    ],
    indexes: [],
    ...overrides,
  }) as unknown as Manifest;

const buildViewManifest = (
  overrides: Partial<ViewManifest> = {},
): ViewManifest => ({
  universalIdentifier: VIEW_UID,
  name: 'All pets',
  objectUniversalIdentifier: PET_UID,
  type: ViewType.TABLE,
  kanbanAggregateOperation: AggregateOperations.COUNT,
  fields: [
    {
      universalIdentifier: INLINE_VIEW_FIELD_UID,
      fieldMetadataUniversalIdentifier: PET_NAME_FIELD_UID,
      position: 0,
      aggregateOperation: AggregateOperations.COUNT,
    },
  ],
  sorts: [
    {
      universalIdentifier: VIEW_SORT_UID,
      fieldMetadataUniversalIdentifier: PET_NAME_FIELD_UID,
      direction: ViewSortDirection.ASC,
    },
  ],
  ...overrides,
});

const buildViewFieldManifest = (
  overrides: Partial<StandaloneViewFieldManifest> = {},
): StandaloneViewFieldManifest => ({
  universalIdentifier: VIEW_FIELD_UID,
  viewUniversalIdentifier: VIEW_UID,
  fieldMetadataUniversalIdentifier: PET_NAME_FIELD_UID,
  position: 1,
  aggregateOperation: AggregateOperations.COUNT,
  ...overrides,
});

const buildPageLayoutManifest = (
  overrides: Partial<PageLayoutManifest> = {},
): PageLayoutManifest => ({
  universalIdentifier: PAGE_LAYOUT_UID,
  name: 'Pet page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: PET_UID,
  tabs: [
    {
      universalIdentifier: PAGE_LAYOUT_TAB_UID,
      title: 'Overview',
      position: 0,
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: WIDGET_UID,
          title: 'Notes',
          type: 'NOTES',
          objectUniversalIdentifier: PET_UID,
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: 0,
          },
          configuration: { configurationType: 'NOTES' },
        },
      ],
    },
  ],
  ...overrides,
});

const buildPageLayoutTabManifest = (
  overrides: Partial<PageLayoutTabManifest> = {},
): PageLayoutTabManifest => ({
  universalIdentifier: STANDALONE_TAB_UID,
  pageLayoutUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage
      .universalIdentifier,
  title: 'Extra',
  position: 60,
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  ...overrides,
});

const buildNavigationMenuItemManifest = (
  overrides: Partial<NavigationMenuItemManifest> = {},
): NavigationMenuItemManifest => ({
  universalIdentifier: NAVIGATION_MENU_ITEM_UID,
  type: NavigationMenuItemType.OBJECT,
  position: 8,
  targetObjectUniversalIdentifier: PET_UID,
  ...overrides,
});

describe('buildPullEntities', () => {
  it('should strip the checksums the build recomputes from the application config', () => {
    const { entities } = buildPullEntities(buildManifest());
    const application = entities.find(
      (entity) => entity.kind === 'application',
    );

    expect(application?.config).toEqual({
      universalIdentifier: APP_UID,
      displayName: 'Pets',
      description: 'Pet tracking',
      defaultRoleUniversalIdentifier: 'role-uid',
    });
    expect(
      `${application?.defaultFolder}/${application?.fileBaseName}${application?.fileSuffix}`,
    ).toBe('src/application.config.ts');
  });

  it('should write an object verbatim, keeping its name field and label identifier', () => {
    const manifest = buildManifest();
    const { entities } = buildPullEntities(manifest);
    const object = entities.find((entity) => entity.kind === 'object');

    expect(object?.config).toEqual(manifest.objects[0]);
    expect(
      `${object?.defaultFolder}/${object?.fileBaseName}${object?.fileSuffix}`,
    ).toBe('src/objects/pet.object.ts');
  });

  it('should name a field on a standard object after that object', () => {
    const { entities } = buildPullEntities(buildManifest());
    const field = entities.find((entity) => entity.kind === 'field');

    expect(
      `${field?.defaultFolder}/${field?.fileBaseName}${field?.fileSuffix}`,
    ).toBe('src/fields/company-cared-for-pets.field.ts');
  });

  it('should name an index after its object and fields', () => {
    const { entities } = buildPullEntities(
      buildManifest({
        indexes: [
          {
            universalIdentifier: INDEX_UID,
            objectUniversalIdentifier: PET_UID,
            fields: [{ fieldUniversalIdentifier: PET_NAME_FIELD_UID }],
          },
        ],
      } as unknown as Partial<Manifest>),
    );
    const index = entities.find((entity) => entity.kind === 'index');

    expect(
      `${index?.defaultFolder}/${index?.fileBaseName}${index?.fileSuffix}`,
    ).toBe('src/indexes/pet-name.index.ts');
  });

  it('should write an object whose label identifier names an engine-derived field, keeping the pointer', () => {
    const junctionObject = {
      universalIdentifier: JUNCTION_UID,
      nameSingular: 'petCareAgreement',
      namePlural: 'petCareAgreements',
      labelSingular: 'Pet care agreement',
      labelPlural: 'Pet care agreements',
      labelIdentifierFieldMetadataUniversalIdentifier: JUNCTION_ID_FIELD_UID,
      fields: [
        {
          universalIdentifier: 'relation-field-uid',
          name: 'pet',
          label: 'Pet',
          type: 'RELATION',
        },
      ],
    };

    const { entities, skipped } = buildPullEntities(
      buildManifest({
        objects: [junctionObject],
      } as unknown as Partial<Manifest>),
    );
    const object = entities.find((entity) => entity.kind === 'object');

    expect(skipped).toEqual([]);
    expect(object?.config).toEqual(junctionObject);
  });

  it('should skip an index whose object is not part of the export', () => {
    const { entities, skipped } = buildPullEntities(
      buildManifest({
        objects: [],
        indexes: [
          {
            universalIdentifier: INDEX_UID,
            objectUniversalIdentifier: 'an-object-of-another-application',
            fields: [{ fieldUniversalIdentifier: 'unknown-field' }],
          },
        ],
      } as unknown as Partial<Manifest>),
    );

    expect(entities.some((entity) => entity.kind === 'index')).toBe(false);
    expect(
      skipped.find((entry) => entry.universalIdentifier === INDEX_UID)?.reason,
    ).toBe('its object is not part of the written source');
  });

  it('should write a view verbatim into src/views with the view enum bindings and its object as parent', () => {
    const viewManifest = buildViewManifest();
    const { entities, skipped } = buildPullEntities(
      buildManifest({ views: [viewManifest] }),
    );
    const view = entities.find((entity) => entity.kind === 'view');

    expect(skipped).toEqual([]);
    expect(view?.universalIdentifier).toBe(VIEW_UID);
    expect(view?.definer).toBe('defineView');
    expect(view?.config).toEqual(viewManifest);
    expect(view?.enumBindings).toEqual(VIEW_ENUM_BINDINGS);
    expect(view?.parentName).toBe('pet');
    expect(
      `${view?.defaultFolder}/${view?.fileBaseName}${view?.fileSuffix}`,
    ).toBe('src/views/all-pets.view.ts');
  });

  it('should give a view on a standard object that object as parent', () => {
    const { entities } = buildPullEntities(
      buildManifest({
        views: [
          buildViewManifest({
            objectUniversalIdentifier:
              STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
          }),
        ],
      }),
    );
    const view = entities.find((entity) => entity.kind === 'view');

    expect(view?.parentName).toBe('person');
  });

  it('should name a view whose name has no kebab-case form after its identifier prefix', () => {
    const { entities } = buildPullEntities(
      buildManifest({ views: [buildViewManifest({ name: '!!!' })] }),
    );
    const view = entities.find((entity) => entity.kind === 'view');

    expect(view?.fileBaseName).toBe('88888888');
  });

  it('should cap the file name of a view with an overlong name', () => {
    const { entities } = buildPullEntities(
      buildManifest({
        views: [
          buildViewManifest({ name: `${'Ab'.repeat(39)} ${'c'.repeat(300)}` }),
        ],
      }),
    );
    const view = entities.find((entity) => entity.kind === 'view');

    expect(view?.fileBaseName).toBe(`${'ab-'.repeat(26)}ab`);
    expect(view?.fileBaseName).toHaveLength(80);
  });

  it('should write a standalone view field into src/view-fields named after the manifest object and field it points to', () => {
    const viewFieldManifest = buildViewFieldManifest();
    const { entities, skipped } = buildPullEntities(
      buildManifest({
        views: [buildViewManifest()],
        viewFields: [viewFieldManifest],
      }),
    );
    const viewField = entities.find((entity) => entity.kind === 'viewField');

    expect(skipped).toEqual([]);
    expect(viewField?.universalIdentifier).toBe(VIEW_FIELD_UID);
    expect(viewField?.definer).toBe('defineViewField');
    expect(viewField?.config).toEqual(viewFieldManifest);
    expect(viewField?.enumBindings).toEqual(VIEW_FIELD_ENUM_BINDINGS);
    expect(viewField?.parentName).toBeNull();
    expect(
      `${viewField?.defaultFolder}/${viewField?.fileBaseName}${viewField?.fileSuffix}`,
    ).toBe('src/view-fields/pet-name.view-field.ts');
  });

  it('should name a standalone view field pointing at a manifest field on a standard object after that object', () => {
    const { entities } = buildPullEntities(
      buildManifest({
        views: [buildViewManifest()],
        viewFields: [
          buildViewFieldManifest({
            fieldMetadataUniversalIdentifier: COMPANY_FIELD_UID,
          }),
        ],
      }),
    );
    const viewField = entities.find((entity) => entity.kind === 'viewField');

    expect(viewField?.fileBaseName).toBe('company-cared-for-pets');
  });

  it('should name a standalone view field pointing at a standard field after the standard object and field', () => {
    const { entities } = buildPullEntities(
      buildManifest({
        views: [buildViewManifest()],
        viewFields: [
          buildViewFieldManifest({
            fieldMetadataUniversalIdentifier:
              STANDARD_OBJECT_FIELDS.person.jobTitle.universalIdentifier,
          }),
        ],
      }),
    );
    const viewField = entities.find((entity) => entity.kind === 'viewField');

    expect(viewField?.fileBaseName).toBe('person-job-title');
  });

  it('should name a standalone view field pointing at an unknown field after its identifier prefix', () => {
    const { entities } = buildPullEntities(
      buildManifest({
        views: [buildViewManifest()],
        viewFields: [
          buildViewFieldManifest({
            fieldMetadataUniversalIdentifier: 'a-field-of-another-application',
          }),
        ],
      }),
    );
    const viewField = entities.find((entity) => entity.kind === 'viewField');

    expect(viewField?.fileBaseName).toBe('99999999');
  });

  it('should write a page layout verbatim into src/page-layouts with the page layout enum bindings and its object as parent', () => {
    const pageLayoutManifest = buildPageLayoutManifest();
    const { entities, skipped } = buildPullEntities(
      buildManifest({ pageLayouts: [pageLayoutManifest] }),
    );
    const pageLayout = entities.find((entity) => entity.kind === 'pageLayout');

    expect(skipped).toEqual([]);
    expect(pageLayout?.universalIdentifier).toBe(PAGE_LAYOUT_UID);
    expect(pageLayout?.definer).toBe('definePageLayout');
    expect(pageLayout?.config).toEqual(pageLayoutManifest);
    expect(pageLayout?.enumBindings).toEqual(PAGE_LAYOUT_ENUM_BINDINGS);
    expect(pageLayout?.parentName).toBe('pet');
    expect(
      `${pageLayout?.defaultFolder}/${pageLayout?.fileBaseName}${pageLayout?.fileSuffix}`,
    ).toBe('src/page-layouts/pet-page.page-layout.ts');
  });

  it('should drop the GraphQL typename keys a widget configuration saved from the UI carries', () => {
    const pageLayoutManifest = buildPageLayoutManifest();
    const widgetWithTypename = {
      ...pageLayoutManifest.tabs![0].widgets![0],
      configuration: {
        __typename: 'RecordTableConfiguration',
        configurationType: 'RECORD_TABLE',
        recordLimit: null,
        viewUniversalIdentifier: VIEW_UID,
      },
    };
    const { entities } = buildPullEntities(
      buildManifest({
        pageLayouts: [
          {
            ...pageLayoutManifest,
            tabs: [
              { ...pageLayoutManifest.tabs![0], widgets: [widgetWithTypename] },
            ],
          },
        ] as unknown as PageLayoutManifest[],
        pageLayoutTabs: [
          buildPageLayoutTabManifest({
            widgets: [widgetWithTypename],
          } as unknown as Partial<PageLayoutTabManifest>),
        ],
      }),
    );
    const pageLayout = entities.find((entity) => entity.kind === 'pageLayout');
    const pageLayoutTab = entities.find(
      (entity) => entity.kind === 'pageLayoutTab',
    );
    const expectedConfiguration = {
      configurationType: 'RECORD_TABLE',
      recordLimit: null,
      viewUniversalIdentifier: VIEW_UID,
    };

    expect(
      (pageLayout?.config as PageLayoutManifest).tabs?.[0].widgets?.[0]
        .configuration,
    ).toEqual(expectedConfiguration);
    expect(
      (pageLayoutTab?.config as PageLayoutTabManifest).widgets?.[0]
        .configuration,
    ).toEqual(expectedConfiguration);
  });

  it('should give a page layout on a standard object that object as parent', () => {
    const { entities } = buildPullEntities(
      buildManifest({
        pageLayouts: [
          buildPageLayoutManifest({
            objectUniversalIdentifier:
              STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
          }),
        ],
      }),
    );
    const pageLayout = entities.find((entity) => entity.kind === 'pageLayout');

    expect(pageLayout?.parentName).toBe('person');
  });

  it('should give a page layout without an object no parent', () => {
    const {
      objectUniversalIdentifier: _objectUniversalIdentifier,
      ...standalonePageManifest
    } = buildPageLayoutManifest({ name: 'Pet docs', type: 'STANDALONE_PAGE' });
    const { entities, skipped } = buildPullEntities(
      buildManifest({ pageLayouts: [standalonePageManifest] }),
    );
    const pageLayout = entities.find((entity) => entity.kind === 'pageLayout');

    expect(skipped).toEqual([]);
    expect(pageLayout?.parentName).toBeNull();
    expect(pageLayout?.fileBaseName).toBe('pet-docs');
  });

  it('should name a page layout whose name has no kebab-case form after its identifier prefix', () => {
    const { entities } = buildPullEntities(
      buildManifest({
        pageLayouts: [buildPageLayoutManifest({ name: '!!!' })],
      }),
    );
    const pageLayout = entities.find((entity) => entity.kind === 'pageLayout');

    expect(pageLayout?.fileBaseName).toBe('cccccccc');
  });

  it('should write a standalone page layout tab into src/page-layout-tabs with the tab enum bindings and its standard page layout as parent', () => {
    const pageLayoutTabManifest = buildPageLayoutTabManifest();
    const { entities, skipped } = buildPullEntities(
      buildManifest({ pageLayoutTabs: [pageLayoutTabManifest] }),
    );
    const pageLayoutTab = entities.find(
      (entity) => entity.kind === 'pageLayoutTab',
    );

    expect(skipped).toEqual([]);
    expect(pageLayoutTab?.universalIdentifier).toBe(STANDALONE_TAB_UID);
    expect(pageLayoutTab?.definer).toBe('definePageLayoutTab');
    expect(pageLayoutTab?.config).toEqual(pageLayoutTabManifest);
    expect(pageLayoutTab?.enumBindings).toEqual(PAGE_LAYOUT_TAB_ENUM_BINDINGS);
    expect(pageLayoutTab?.parentName).toBe('companyRecordPage');
    expect(
      `${pageLayoutTab?.defaultFolder}/${pageLayoutTab?.fileBaseName}${pageLayoutTab?.fileSuffix}`,
    ).toBe('src/page-layout-tabs/extra.page-layout-tab.ts');
  });

  it('should give a standalone tab on the record page of a manifest object that page as parent', () => {
    const { entities } = buildPullEntities(
      buildManifest({
        pageLayoutTabs: [
          buildPageLayoutTabManifest({
            pageLayoutUniversalIdentifier:
              getSystemRecordPageLayoutUniversalIdentifier({
                objectMetadataApplicationUniversalIdentifier: APP_UID,
                objectUniversalIdentifier: PET_UID,
              }),
          }),
        ],
      }),
    );
    const pageLayoutTab = entities.find(
      (entity) => entity.kind === 'pageLayoutTab',
    );

    expect(pageLayoutTab?.parentName).toBe('petRecordPage');
  });

  it('should give a standalone tab on a page layout of the manifest that layout as parent', () => {
    const { entities } = buildPullEntities(
      buildManifest({
        pageLayouts: [buildPageLayoutManifest()],
        pageLayoutTabs: [
          buildPageLayoutTabManifest({
            pageLayoutUniversalIdentifier: PAGE_LAYOUT_UID,
          }),
        ],
      }),
    );
    const pageLayoutTab = entities.find(
      (entity) => entity.kind === 'pageLayoutTab',
    );

    expect(pageLayoutTab?.parentName).toBe('Pet page');
  });

  it('should skip a standalone tab that does not name its page layout', () => {
    const {
      pageLayoutUniversalIdentifier: _pageLayoutUniversalIdentifier,
      ...tabWithoutPageLayout
    } = buildPageLayoutTabManifest();
    const { entities, skipped } = buildPullEntities(
      buildManifest({ pageLayoutTabs: [tabWithoutPageLayout] }),
    );

    expect(entities.some((entity) => entity.kind === 'pageLayoutTab')).toBe(
      false,
    );
    expect(skipped).toEqual([
      {
        kind: 'pageLayoutTab',
        universalIdentifier: STANDALONE_TAB_UID,
        reason: 'it does not name the page layout it belongs to',
      },
    ]);
  });

  it('should write a navigation menu item verbatim into src/navigation-menu-items with the navigation menu item enum bindings, named after the object it targets', () => {
    const navigationMenuItemManifest = buildNavigationMenuItemManifest();
    const { entities, skipped } = buildPullEntities(
      buildManifest({ navigationMenuItems: [navigationMenuItemManifest] }),
    );
    const navigationMenuItem = entities.find(
      (entity) => entity.kind === 'navigationMenuItem',
    );

    expect(skipped).toEqual([]);
    expect(navigationMenuItem?.universalIdentifier).toBe(
      NAVIGATION_MENU_ITEM_UID,
    );
    expect(navigationMenuItem?.definer).toBe('defineNavigationMenuItem');
    expect(navigationMenuItem?.config).toEqual(navigationMenuItemManifest);
    expect(navigationMenuItem?.enumBindings).toEqual(
      NAVIGATION_MENU_ITEM_ENUM_BINDINGS,
    );
    expect(navigationMenuItem?.parentName).toBeNull();
    expect(
      `${navigationMenuItem?.defaultFolder}/${navigationMenuItem?.fileBaseName}${navigationMenuItem?.fileSuffix}`,
    ).toBe('src/navigation-menu-items/pet.navigation-menu-item.ts');
  });

  it('should prefer the name a navigation menu item carries over the object it targets', () => {
    const { entities } = buildPullEntities(
      buildManifest({
        navigationMenuItems: [
          buildNavigationMenuItemManifest({ name: 'Pet shelter' }),
        ],
      }),
    );
    const navigationMenuItem = entities.find(
      (entity) => entity.kind === 'navigationMenuItem',
    );

    expect(navigationMenuItem?.fileBaseName).toBe('pet-shelter');
  });

  it('should name a navigation menu item with an empty name after the object it targets', () => {
    const { entities } = buildPullEntities(
      buildManifest({
        navigationMenuItems: [buildNavigationMenuItemManifest({ name: '' })],
      }),
    );
    const navigationMenuItem = entities.find(
      (entity) => entity.kind === 'navigationMenuItem',
    );

    expect(navigationMenuItem?.fileBaseName).toBe('pet');
  });

  it('should name a navigation menu item whose name is only whitespace after the object it targets', () => {
    const { entities } = buildPullEntities(
      buildManifest({
        navigationMenuItems: [buildNavigationMenuItemManifest({ name: '   ' })],
      }),
    );
    const navigationMenuItem = entities.find(
      (entity) => entity.kind === 'navigationMenuItem',
    );

    expect(navigationMenuItem?.fileBaseName).toBe('pet');
  });

  it('should name a navigation menu item targeting a standard object after that object', () => {
    const { entities } = buildPullEntities(
      buildManifest({
        navigationMenuItems: [
          buildNavigationMenuItemManifest({
            targetObjectUniversalIdentifier:
              STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person,
          }),
        ],
      }),
    );
    const navigationMenuItem = entities.find(
      (entity) => entity.kind === 'navigationMenuItem',
    );

    expect(navigationMenuItem?.fileBaseName).toBe('person');
  });

  it('should name a navigation menu item pointing at a view of the manifest after that view', () => {
    const {
      targetObjectUniversalIdentifier: _targetObjectUniversalIdentifier,
      ...viewItemManifest
    } = buildNavigationMenuItemManifest({
      type: NavigationMenuItemType.VIEW,
      viewUniversalIdentifier: VIEW_UID,
    });
    const { entities } = buildPullEntities(
      buildManifest({
        views: [buildViewManifest()],
        navigationMenuItems: [viewItemManifest],
      }),
    );
    const navigationMenuItem = entities.find(
      (entity) => entity.kind === 'navigationMenuItem',
    );

    expect(navigationMenuItem?.fileBaseName).toBe('all-pets');
  });

  it('should name a navigation menu item pointing at the index view of a manifest object after that view', () => {
    const {
      targetObjectUniversalIdentifier: _targetObjectUniversalIdentifier,
      ...indexViewItemManifest
    } = buildNavigationMenuItemManifest({
      type: NavigationMenuItemType.VIEW,
      viewUniversalIdentifier: getSystemViewUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier: APP_UID,
        objectUniversalIdentifier: PET_UID,
        viewKey: SYSTEM_VIEW_KEYS.INDEX,
      }),
    });
    const { entities } = buildPullEntities(
      buildManifest({ navigationMenuItems: [indexViewItemManifest] }),
    );
    const navigationMenuItem = entities.find(
      (entity) => entity.kind === 'navigationMenuItem',
    );

    expect(navigationMenuItem?.fileBaseName).toBe('pet-index-view');
  });

  it('should name a navigation menu item pointing at a page layout after that layout', () => {
    const {
      targetObjectUniversalIdentifier: _targetObjectUniversalIdentifier,
      ...pageLayoutItemManifest
    } = buildNavigationMenuItemManifest({
      type: NavigationMenuItemType.PAGE_LAYOUT,
      pageLayoutUniversalIdentifier: PAGE_LAYOUT_UID,
    });
    const { entities } = buildPullEntities(
      buildManifest({
        pageLayouts: [buildPageLayoutManifest()],
        navigationMenuItems: [pageLayoutItemManifest],
      }),
    );
    const navigationMenuItem = entities.find(
      (entity) => entity.kind === 'navigationMenuItem',
    );

    expect(navigationMenuItem?.fileBaseName).toBe('pet-page');
  });

  it('should name a navigation menu item that points at nothing of the manifest after its identifier prefix', () => {
    const {
      targetObjectUniversalIdentifier: _targetObjectUniversalIdentifier,
      ...linkItemManifest
    } = buildNavigationMenuItemManifest({
      type: NavigationMenuItemType.LINK,
      link: 'https://twenty.com',
    });
    const { entities } = buildPullEntities(
      buildManifest({ navigationMenuItems: [linkItemManifest] }),
    );
    const navigationMenuItem = entities.find(
      (entity) => entity.kind === 'navigationMenuItem',
    );

    expect(navigationMenuItem?.fileBaseName).toBe('10101010');
  });

  it('should give a navigation menu item sitting in a folder that folder as parent', () => {
    const {
      targetObjectUniversalIdentifier: _targetObjectUniversalIdentifier,
      ...folderManifest
    } = buildNavigationMenuItemManifest({
      universalIdentifier: NAVIGATION_FOLDER_UID,
      type: NavigationMenuItemType.FOLDER,
      name: 'Care',
      position: 0,
    });
    const { entities } = buildPullEntities(
      buildManifest({
        navigationMenuItems: [
          folderManifest,
          buildNavigationMenuItemManifest({
            folderUniversalIdentifier: NAVIGATION_FOLDER_UID,
          }),
        ],
      }),
    );
    const navigationMenuItem = entities.find(
      (entity) => entity.universalIdentifier === NAVIGATION_MENU_ITEM_UID,
    );

    expect(navigationMenuItem?.parentName).toBe('Care');
  });

  it('should give a navigation menu item sitting in a folder without a name no parent', () => {
    const {
      targetObjectUniversalIdentifier: _targetObjectUniversalIdentifier,
      ...folderManifest
    } = buildNavigationMenuItemManifest({
      universalIdentifier: NAVIGATION_FOLDER_UID,
      type: NavigationMenuItemType.FOLDER,
      name: '',
      position: 0,
    });
    const { entities } = buildPullEntities(
      buildManifest({
        navigationMenuItems: [
          folderManifest,
          buildNavigationMenuItemManifest({
            folderUniversalIdentifier: NAVIGATION_FOLDER_UID,
          }),
        ],
      }),
    );
    const navigationMenuItem = entities.find(
      (entity) => entity.universalIdentifier === NAVIGATION_MENU_ITEM_UID,
    );

    expect(navigationMenuItem?.parentName).toBeNull();
  });

  it('should give a navigation menu item sitting in a folder named only with punctuation no parent', () => {
    const {
      targetObjectUniversalIdentifier: _targetObjectUniversalIdentifier,
      ...folderManifest
    } = buildNavigationMenuItemManifest({
      universalIdentifier: NAVIGATION_FOLDER_UID,
      type: NavigationMenuItemType.FOLDER,
      name: '///',
      position: 0,
    });
    const { entities } = buildPullEntities(
      buildManifest({
        navigationMenuItems: [
          folderManifest,
          buildNavigationMenuItemManifest({
            folderUniversalIdentifier: NAVIGATION_FOLDER_UID,
          }),
        ],
      }),
    );
    const navigationMenuItem = entities.find(
      (entity) => entity.universalIdentifier === NAVIGATION_MENU_ITEM_UID,
    );

    expect(navigationMenuItem?.parentName).toBeNull();
  });

  it('should give a navigation menu item whose folder is not part of the export no parent', () => {
    const { entities, skipped } = buildPullEntities(
      buildManifest({
        navigationMenuItems: [
          buildNavigationMenuItemManifest({
            folderUniversalIdentifier: 'a-folder-of-another-application',
          }),
        ],
      }),
    );
    const navigationMenuItem = entities.find(
      (entity) => entity.kind === 'navigationMenuItem',
    );

    expect(skipped).toEqual([]);
    expect(navigationMenuItem?.parentName).toBeNull();
  });

  it('should report a standalone page layout widget as not written rather than dropping it', () => {
    const { entities, skipped } = buildPullEntities(
      buildManifest({
        pageLayoutWidgets: [
          {
            universalIdentifier: WIDGET_UID,
            pageLayoutTabUniversalIdentifier: PAGE_LAYOUT_TAB_UID,
            title: 'Docs',
            type: 'IFRAME',
            position: {
              layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
              index: 1000,
            },
            configuration: {
              configurationType: 'IFRAME',
              url: 'https://example.com/docs',
            },
          },
        ],
      } as Partial<Manifest>),
    );

    expect(
      entities.some((entity) => entity.universalIdentifier === WIDGET_UID),
    ).toBe(false);
    expect(skipped).toEqual([
      {
        kind: 'pageLayoutWidget',
        universalIdentifier: WIDGET_UID,
        reason: 'has a source form this version does not write yet',
      },
    ]);
  });

  it('should build a manifest that has no views, view fields, page layouts and page layout tabs properties without producing their entities', () => {
    const {
      views: _views,
      viewFields: _viewFields,
      pageLayouts: _pageLayouts,
      pageLayoutTabs: _pageLayoutTabs,
      ...manifestWithoutViews
    } = buildManifest({
      views: [buildViewManifest()],
      viewFields: [buildViewFieldManifest()],
      pageLayouts: [buildPageLayoutManifest()],
      pageLayoutTabs: [buildPageLayoutTabManifest()],
    });

    const { entities, skipped } = buildPullEntities(
      manifestWithoutViews as unknown as Manifest,
    );

    expect(skipped).toEqual([]);
    expect(entities.map((entity) => entity.kind)).toEqual([
      'application',
      'object',
      'field',
    ]);
  });

  it('should never skip a view, a view field, a page layout or a page layout tab, even when their parent is unknown', () => {
    const { entities, skipped } = buildPullEntities(
      buildManifest({
        objects: [],
        views: [
          buildViewManifest({
            objectUniversalIdentifier: 'an-object-of-another-application',
          }),
        ],
        viewFields: [
          buildViewFieldManifest({
            fieldMetadataUniversalIdentifier: 'a-field-of-another-application',
          }),
        ],
        pageLayouts: [
          buildPageLayoutManifest({
            objectUniversalIdentifier: 'an-object-of-another-application',
          }),
        ],
        pageLayoutTabs: [
          buildPageLayoutTabManifest({
            pageLayoutUniversalIdentifier:
              'a-page-layout-of-another-application',
          }),
        ],
      }),
    );
    const view = entities.find((entity) => entity.kind === 'view');
    const pageLayout = entities.find((entity) => entity.kind === 'pageLayout');
    const pageLayoutTab = entities.find(
      (entity) => entity.kind === 'pageLayoutTab',
    );

    expect(skipped).toEqual([]);
    expect(entities.map((entity) => entity.kind)).toEqual(
      expect.arrayContaining([
        'view',
        'viewField',
        'pageLayout',
        'pageLayoutTab',
      ]),
    );
    expect(view?.parentName).toBeNull();
    expect(pageLayout?.parentName).toBeNull();
    expect(pageLayoutTab?.parentName).toBeNull();
  });
});
