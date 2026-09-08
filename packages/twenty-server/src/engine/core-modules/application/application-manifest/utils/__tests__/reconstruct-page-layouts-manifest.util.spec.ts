import {
  type PageLayoutManifest,
  type PageLayoutTabManifest,
  type PageLayoutWidgetManifest,
} from 'twenty-shared/application';
import {
  AggregateOperations,
  FieldMetadataType,
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { fromPageLayoutManifestToUniversalFlatPageLayout } from 'src/engine/core-modules/application/application-manifest/converters/from-page-layout-manifest-to-universal-flat-page-layout.util';
import { fromPageLayoutTabManifestToUniversalFlatPageLayoutTab } from 'src/engine/core-modules/application/application-manifest/converters/from-page-layout-tab-manifest-to-universal-flat-page-layout-tab.util';
import { fromFrontComponentManifestToUniversalFlatFrontComponent } from 'src/engine/core-modules/application/application-manifest/converters/from-front-component-manifest-to-universal-flat-front-component.util';
import { fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget } from 'src/engine/core-modules/application/application-manifest/converters/from-page-layout-widget-manifest-to-universal-flat-page-layout-widget.util';
import { fromViewManifestToUniversalFlatView } from 'src/engine/core-modules/application/application-manifest/converters/from-view-manifest-to-universal-flat-view.util';
import { reconstructPageLayoutsManifest } from 'src/engine/core-modules/application/application-manifest/utils/reconstruct-page-layouts-manifest.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

const APP_ID = 'application-id';
const WORKSPACE_ID = 'workspace-id';
const NOW = '2026-09-08T10:00:00.000Z';
const APP_UID = '11111111-1111-4111-8111-111111111111';
const PET_UID = '22222222-2222-4222-8222-222222222222';
const NAME_FIELD_UID = '33333333-3333-4333-8333-333333333333';
const FRONT_COMPONENT_UID = '44444444-4444-4444-8444-444444444444';
const MISSING_UID = '55555555-5555-4555-8555-555555555555';
const ALL_PETS_VIEW_UID = '66666666-6666-4666-8666-666666666666';
const PET_PAGE_UID = '77777777-7777-4777-8777-777777777777';
const ENGINE_PAGE_UID = '88888888-8888-4888-8888-888888888888';
const COMPANY_PAGE_UID = '99999999-9999-4999-8999-999999999999';
const NAMELESS_PAGE_UID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const DETAILS_TAB_UID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const OVERVIEW_TAB_UID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const ENGINE_TAB_UID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const EXTRA_TAB_UID = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const COMPANY_TAB_UID = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
const EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS = new Set([PET_UID]);
const UNKNOWN_REFERENCE: Record<string, string> = {
  workflowUniversalIdentifier: MISSING_UID,
};

const buildMaps = ({
  objects = [],
  fields = [],
  views = [],
  frontComponents = [],
  pageLayouts = [],
  pageLayoutTabs = [],
  pageLayoutWidgets = [],
}: {
  objects?: FlatObjectMetadata[];
  fields?: FlatFieldMetadata[];
  views?: FlatView[];
  frontComponents?: FlatFrontComponent[];
  pageLayouts?: FlatPageLayout[];
  pageLayoutTabs?: FlatPageLayoutTab[];
  pageLayoutWidgets?: FlatPageLayoutWidget[];
}): AllFlatEntityMaps => {
  const maps = createEmptyAllFlatEntityMaps();

  return {
    ...maps,
    flatObjectMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: objects,
      flatEntityMaps: maps.flatObjectMetadataMaps,
    }),
    flatFieldMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: fields,
      flatEntityMaps: maps.flatFieldMetadataMaps,
    }),
    flatViewMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: views,
      flatEntityMaps: maps.flatViewMaps,
    }),
    flatFrontComponentMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: frontComponents,
      flatEntityMaps: maps.flatFrontComponentMaps,
    }),
    flatPageLayoutMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: pageLayouts,
      flatEntityMaps: maps.flatPageLayoutMaps,
    }),
    flatPageLayoutTabMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: pageLayoutTabs,
      flatEntityMaps: maps.flatPageLayoutTabMaps,
    }),
    flatPageLayoutWidgetMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: pageLayoutWidgets,
      flatEntityMaps: maps.flatPageLayoutWidgetMaps,
    }),
  };
};

const petObject = getFlatObjectMetadataMock({
  universalIdentifier: PET_UID,
  applicationId: APP_ID,
  applicationUniversalIdentifier: APP_UID,
  nameSingular: 'pet',
  namePlural: 'pets',
  labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UID,
});

const nameField = getFlatFieldMetadataMock({
  universalIdentifier: NAME_FIELD_UID,
  name: 'name',
  objectMetadataId: petObject.id,
  objectMetadataUniversalIdentifier: PET_UID,
  applicationId: APP_ID,
  applicationUniversalIdentifier: APP_UID,
  type: FieldMetadataType.TEXT,
});

const allPetsView: FlatView = {
  ...fromViewManifestToUniversalFlatView({
    viewManifest: {
      universalIdentifier: ALL_PETS_VIEW_UID,
      name: 'All pets',
      objectUniversalIdentifier: PET_UID,
    },
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  }),
  id: `${ALL_PETS_VIEW_UID}-id`,
  workspaceId: WORKSPACE_ID,
  applicationId: APP_ID,
  objectMetadataId: petObject.id,
  kanbanAggregateOperationFieldMetadataId: null,
  calendarFieldMetadataId: null,
  calendarEndFieldMetadataId: null,
  mainGroupByFieldMetadataId: null,
  overrides: null,
  viewFieldIds: [],
  viewFieldGroupIds: [],
  viewFilterIds: [],
  viewGroupIds: [],
  viewFilterGroupIds: [],
  viewSortIds: [],
};

const frontComponent: FlatFrontComponent = {
  ...fromFrontComponentManifestToUniversalFlatFrontComponent({
    frontComponentManifest: {
      universalIdentifier: FRONT_COMPONENT_UID,
      sourceComponentPath: 'src/components/pet-card.tsx',
      builtComponentPath: 'dist/pet-card.js',
      builtComponentChecksum: 'checksum',
      componentName: 'PetCard',
    },
    applicationUniversalIdentifier: APP_UID,
    isSettingsFrontComponent: false,
    now: NOW,
  }),
  id: `${FRONT_COMPONENT_UID}-id`,
  workspaceId: WORKSPACE_ID,
  applicationId: APP_ID,
};

const allFlatEntityMaps = buildMaps({
  objects: [petObject],
  fields: [nameField],
  views: [allPetsView],
  frontComponents: [frontComponent],
});

const buildFlatPageLayout = ({
  pageLayoutManifest,
  ...flatPageLayoutProperties
}: {
  pageLayoutManifest: PageLayoutManifest;
} & Partial<FlatPageLayout>): FlatPageLayout => ({
  ...fromPageLayoutManifestToUniversalFlatPageLayout({
    pageLayoutManifest,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  }),
  id: `${pageLayoutManifest.universalIdentifier}-id`,
  workspaceId: WORKSPACE_ID,
  applicationId: APP_ID,
  objectMetadataId: isDefined(pageLayoutManifest.objectUniversalIdentifier)
    ? `${pageLayoutManifest.objectUniversalIdentifier}-id`
    : null,
  defaultTabToFocusOnMobileAndSidePanelId: null,
  tabIds: [],
  ...flatPageLayoutProperties,
});

const buildFlatPageLayoutTab = ({
  pageLayoutTabManifest,
  pageLayoutUniversalIdentifier,
  ...flatPageLayoutTabProperties
}: {
  pageLayoutTabManifest: PageLayoutTabManifest;
  pageLayoutUniversalIdentifier: string;
} & Partial<FlatPageLayoutTab>): FlatPageLayoutTab => ({
  ...fromPageLayoutTabManifestToUniversalFlatPageLayoutTab({
    pageLayoutTabManifest,
    pageLayoutUniversalIdentifier,
    pageLayoutType: PageLayoutType.RECORD_PAGE,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  }),
  id: `${pageLayoutTabManifest.universalIdentifier}-id`,
  workspaceId: WORKSPACE_ID,
  applicationId: APP_ID,
  pageLayoutId: `${pageLayoutUniversalIdentifier}-id`,
  widgetIds: [],
  ...flatPageLayoutTabProperties,
});

const buildFlatPageLayoutWidget = ({
  pageLayoutWidgetManifest,
  pageLayoutTabUniversalIdentifier,
  ...flatPageLayoutWidgetProperties
}: {
  pageLayoutWidgetManifest: PageLayoutWidgetManifest;
  pageLayoutTabUniversalIdentifier: string;
} & Partial<FlatPageLayoutWidget>): FlatPageLayoutWidget => ({
  ...fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget({
    pageLayoutWidgetManifest,
    pageLayoutTabUniversalIdentifier,
    pageLayoutTabLayoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  }),
  id: `${pageLayoutWidgetManifest.universalIdentifier}-id`,
  workspaceId: WORKSPACE_ID,
  applicationId: APP_ID,
  pageLayoutTabId: `${pageLayoutTabUniversalIdentifier}-id`,
  objectMetadataId: null,
  configuration: { configurationType: WidgetConfigurationType.NOTES },
  overrides: null,
  ...flatPageLayoutWidgetProperties,
});

const PET_PAGE_MANIFEST: PageLayoutManifest = {
  universalIdentifier: PET_PAGE_UID,
  name: 'Pet page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: PET_UID,
};

const ENGINE_PAGE_MANIFEST: PageLayoutManifest = {
  universalIdentifier: ENGINE_PAGE_UID,
  name: 'Default Pet Layout',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: PET_UID,
};

const OVERVIEW_TAB_MANIFEST: PageLayoutTabManifest = {
  universalIdentifier: OVERVIEW_TAB_UID,
  title: 'Overview',
  position: 0,
  icon: 'IconHome',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
};

const DETAILS_TAB_MANIFEST: PageLayoutTabManifest = {
  universalIdentifier: DETAILS_TAB_UID,
  title: 'Details',
  position: 10,
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
};

const buildNotesWidgetManifest = (
  universalIdentifier: string,
): PageLayoutWidgetManifest => ({
  universalIdentifier,
  title: 'Notes',
  type: 'NOTES',
  objectUniversalIdentifier: PET_UID,
  position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 0 },
  configuration: { configurationType: 'NOTES' },
});

const FIELDS_WIDGET_MANIFEST: PageLayoutWidgetManifest = {
  universalIdentifier: 'fields-widget',
  title: 'Fields',
  type: 'FIELDS',
  objectUniversalIdentifier: PET_UID,
  position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 1 },
  configuration: {
    configurationType: 'FIELDS',
    viewUniversalIdentifier: ALL_PETS_VIEW_UID,
    newFieldDefaultVisibility: true,
  },
};

const statusOf = (
  coverage: ReturnType<typeof reconstructPageLayoutsManifest>['coverage'],
  universalIdentifier: string,
) =>
  coverage.find((entry) => entry.universalIdentifier === universalIdentifier);

const reasonOf = (
  coverage: ReturnType<typeof reconstructPageLayoutsManifest>['coverage'],
  universalIdentifier: string,
) => statusOf(coverage, universalIdentifier)?.reason;

describe('reconstructPageLayoutsManifest', () => {
  it('should nest tabs and widgets under an exported page layout and order every collection by universal identifier', () => {
    const { pageLayouts, pageLayoutTabs, coverage } =
      reconstructPageLayoutsManifest({
        applicationAllFlatEntityMaps: buildMaps({
          objects: [petObject],
          pageLayouts: [
            buildFlatPageLayout({ pageLayoutManifest: PET_PAGE_MANIFEST }),
          ],
          pageLayoutTabs: [
            buildFlatPageLayoutTab({
              pageLayoutTabManifest: OVERVIEW_TAB_MANIFEST,
              pageLayoutUniversalIdentifier: PET_PAGE_UID,
            }),
            buildFlatPageLayoutTab({
              pageLayoutTabManifest: DETAILS_TAB_MANIFEST,
              pageLayoutUniversalIdentifier: PET_PAGE_UID,
            }),
          ],
          pageLayoutWidgets: [
            buildFlatPageLayoutWidget({
              pageLayoutWidgetManifest:
                buildNotesWidgetManifest('notes-widget'),
              pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
            }),
            buildFlatPageLayoutWidget({
              pageLayoutWidgetManifest: FIELDS_WIDGET_MANIFEST,
              pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
            }),
          ],
        }),
        allFlatEntityMaps,
        exportedObjectUniversalIdentifiers:
          EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
      });

    expect(pageLayouts).toEqual([
      {
        ...PET_PAGE_MANIFEST,
        tabs: [
          DETAILS_TAB_MANIFEST,
          {
            ...OVERVIEW_TAB_MANIFEST,
            widgets: [
              FIELDS_WIDGET_MANIFEST,
              buildNotesWidgetManifest('notes-widget'),
            ],
          },
        ],
      },
    ]);
    expect(pageLayoutTabs).toEqual([]);
    expect(coverage).toHaveLength(5);
    expect(
      coverage.every(
        ({ status }) => status === ApplicationExportCoverageStatus.EXPORTED,
      ),
    ).toBe(true);
  });

  it('should hide an engine-derived page layout, export a tab added to it standalone with its widgets, and refuse a widget added to an engine-derived tab', () => {
    const { pageLayouts, pageLayoutTabs, coverage } =
      reconstructPageLayoutsManifest({
        applicationAllFlatEntityMaps: buildMaps({
          objects: [petObject],
          pageLayouts: [
            buildFlatPageLayout({
              pageLayoutManifest: ENGINE_PAGE_MANIFEST,
              isSystemSideEffect: true,
            }),
          ],
          pageLayoutTabs: [
            buildFlatPageLayoutTab({
              pageLayoutTabManifest: {
                universalIdentifier: ENGINE_TAB_UID,
                title: 'Home',
                position: 10,
                layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
              },
              pageLayoutUniversalIdentifier: ENGINE_PAGE_UID,
              isSystemSideEffect: true,
            }),
            buildFlatPageLayoutTab({
              pageLayoutTabManifest: {
                universalIdentifier: EXTRA_TAB_UID,
                title: 'Extra',
                position: 60,
                layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
              },
              pageLayoutUniversalIdentifier: ENGINE_PAGE_UID,
            }),
          ],
          pageLayoutWidgets: [
            buildFlatPageLayoutWidget({
              pageLayoutWidgetManifest:
                buildNotesWidgetManifest('extra-widget'),
              pageLayoutTabUniversalIdentifier: EXTRA_TAB_UID,
            }),
            buildFlatPageLayoutWidget({
              pageLayoutWidgetManifest: buildNotesWidgetManifest('home-widget'),
              pageLayoutTabUniversalIdentifier: ENGINE_TAB_UID,
            }),
          ],
        }),
        allFlatEntityMaps,
        exportedObjectUniversalIdentifiers:
          EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
      });

    expect(pageLayouts).toEqual([]);
    expect(pageLayoutTabs).toEqual([
      {
        universalIdentifier: EXTRA_TAB_UID,
        pageLayoutUniversalIdentifier: ENGINE_PAGE_UID,
        title: 'Extra',
        position: 60,
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        widgets: [buildNotesWidgetManifest('extra-widget')],
      },
    ]);
    expect(statusOf(coverage, ENGINE_PAGE_UID)?.status).toBe(
      ApplicationExportCoverageStatus.ENGINE_DERIVED,
    );
    expect(statusOf(coverage, ENGINE_TAB_UID)?.status).toBe(
      ApplicationExportCoverageStatus.ENGINE_DERIVED,
    );
    expect(statusOf(coverage, EXTRA_TAB_UID)?.status).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(coverage, 'extra-widget')?.status).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(statusOf(coverage, 'home-widget')).toEqual({
      metadataName: 'pageLayoutWidget',
      universalIdentifier: 'home-widget',
      status: ApplicationExportCoverageStatus.UNSUPPORTED,
      reason: 'page layout widget on an engine-derived page layout tab',
    });
  });

  it('should export a tab on a page layout outside the application standalone and refuse a widget on a tab outside the application', () => {
    const { pageLayoutTabs, coverage } = reconstructPageLayoutsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        pageLayoutTabs: [
          buildFlatPageLayoutTab({
            pageLayoutTabManifest: {
              universalIdentifier: COMPANY_TAB_UID,
              title: 'Tagline',
              position: 60,
              layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            },
            pageLayoutUniversalIdentifier: COMPANY_PAGE_UID,
          }),
        ],
        pageLayoutWidgets: [
          buildFlatPageLayoutWidget({
            pageLayoutWidgetManifest:
              buildNotesWidgetManifest('company-widget'),
            pageLayoutTabUniversalIdentifier: COMPANY_TAB_UID,
          }),
          buildFlatPageLayoutWidget({
            pageLayoutWidgetManifest:
              buildNotesWidgetManifest('foreign-widget'),
            pageLayoutTabUniversalIdentifier: 'foreign-tab',
          }),
        ],
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
    });

    expect(
      pageLayoutTabs.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual([COMPANY_TAB_UID]);
    expect(pageLayoutTabs[0].pageLayoutUniversalIdentifier).toBe(
      COMPANY_PAGE_UID,
    );
    expect(pageLayoutTabs[0].widgets).toEqual([
      buildNotesWidgetManifest('company-widget'),
    ]);
    expect(statusOf(coverage, 'company-widget')?.status).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(reasonOf(coverage, 'foreign-widget')).toBe(
      'page layout widget on a page layout tab outside the application',
    );
  });

  it('should refuse an unsupported page layout together with its tab and widget', () => {
    const { pageLayouts, pageLayoutTabs, coverage } =
      reconstructPageLayoutsManifest({
        applicationAllFlatEntityMaps: buildMaps({
          objects: [petObject],
          pageLayouts: [
            buildFlatPageLayout({
              pageLayoutManifest: {
                ...PET_PAGE_MANIFEST,
                universalIdentifier: NAMELESS_PAGE_UID,
                name: '',
              },
            }),
          ],
          pageLayoutTabs: [
            buildFlatPageLayoutTab({
              pageLayoutTabManifest: OVERVIEW_TAB_MANIFEST,
              pageLayoutUniversalIdentifier: NAMELESS_PAGE_UID,
            }),
          ],
          pageLayoutWidgets: [
            buildFlatPageLayoutWidget({
              pageLayoutWidgetManifest:
                buildNotesWidgetManifest('nameless-widget'),
              pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
            }),
          ],
        }),
        allFlatEntityMaps,
        exportedObjectUniversalIdentifiers:
          EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
      });

    expect(pageLayouts).toEqual([]);
    expect(pageLayoutTabs).toEqual([]);
    expect(reasonOf(coverage, NAMELESS_PAGE_UID)).toBe(
      'page layout without a name',
    );
    expect(reasonOf(coverage, OVERVIEW_TAB_UID)).toBe(
      'page layout tab of an unsupported page layout',
    );
    expect(reasonOf(coverage, 'nameless-widget')).toBe(
      'page layout widget of an unsupported page layout tab',
    );
  });

  it('should tell the page layout reasons apart', () => {
    const { coverage } = reconstructPageLayoutsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        pageLayouts: [
          buildFlatPageLayout({
            pageLayoutManifest: {
              ...PET_PAGE_MANIFEST,
              universalIdentifier: 'unsupported-object-page',
            },
          }),
          buildFlatPageLayout({
            pageLayoutManifest: {
              ...PET_PAGE_MANIFEST,
              universalIdentifier: 'missing-object-page',
              objectUniversalIdentifier: MISSING_UID,
            },
          }),
          buildFlatPageLayout({
            pageLayoutManifest: {
              ...PET_PAGE_MANIFEST,
              universalIdentifier: 'engine-default-tab-page',
              objectUniversalIdentifier: undefined,
              defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
                ENGINE_TAB_UID,
            },
          }),
          buildFlatPageLayout({
            pageLayoutManifest: {
              ...PET_PAGE_MANIFEST,
              universalIdentifier: 'foreign-default-tab-page',
              objectUniversalIdentifier: undefined,
              defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
                OVERVIEW_TAB_UID,
            },
          }),
          buildFlatPageLayout({
            pageLayoutManifest: {
              ...PET_PAGE_MANIFEST,
              universalIdentifier: 'missing-default-tab-page',
              objectUniversalIdentifier: undefined,
              defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
                MISSING_UID,
            },
          }),
        ],
        pageLayoutTabs: [
          buildFlatPageLayoutTab({
            pageLayoutTabManifest: {
              universalIdentifier: ENGINE_TAB_UID,
              title: 'Home',
              position: 10,
            },
            pageLayoutUniversalIdentifier: 'engine-default-tab-page',
            isSystemSideEffect: true,
          }),
          buildFlatPageLayoutTab({
            pageLayoutTabManifest: OVERVIEW_TAB_MANIFEST,
            pageLayoutUniversalIdentifier: PET_PAGE_UID,
          }),
        ],
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: new Set<string>(),
    });

    expect(reasonOf(coverage, 'unsupported-object-page')).toBe(
      'page layout on an unsupported object',
    );
    expect(reasonOf(coverage, 'missing-object-page')).toBe(
      'page layout on an object that does not exist',
    );
    expect(reasonOf(coverage, 'engine-default-tab-page')).toBe(
      'page layout whose default tab is not exported',
    );
    expect(reasonOf(coverage, 'foreign-default-tab-page')).toBe(
      'page layout whose default tab is not exported',
    );
    expect(reasonOf(coverage, 'missing-default-tab-page')).toBe(
      'page layout whose default tab is not exported',
    );
  });

  it('should order exported page layouts and standalone tabs by universal identifier', () => {
    const { pageLayouts, pageLayoutTabs } = reconstructPageLayoutsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        pageLayouts: [
          buildFlatPageLayout({
            pageLayoutManifest: {
              ...PET_PAGE_MANIFEST,
              universalIdentifier: 'z-page',
            },
          }),
          buildFlatPageLayout({
            pageLayoutManifest: ENGINE_PAGE_MANIFEST,
            isSystemSideEffect: true,
          }),
          buildFlatPageLayout({
            pageLayoutManifest: {
              ...PET_PAGE_MANIFEST,
              universalIdentifier: 'a-page',
            },
          }),
        ],
        pageLayoutTabs: [
          buildFlatPageLayoutTab({
            pageLayoutTabManifest: {
              universalIdentifier: 'z-tab',
              title: 'Z',
              position: 1,
            },
            pageLayoutUniversalIdentifier: ENGINE_PAGE_UID,
          }),
          buildFlatPageLayoutTab({
            pageLayoutTabManifest: {
              universalIdentifier: 'a-tab',
              title: 'A',
              position: 2,
            },
            pageLayoutUniversalIdentifier: COMPANY_PAGE_UID,
          }),
        ],
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
    });

    expect(
      pageLayouts.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(['a-page', 'z-page']);
    expect(
      pageLayoutTabs.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(['a-tab', 'z-tab']);
  });

  it('should refuse the widgets the manifest cannot carry', () => {
    const { coverage } = reconstructPageLayoutsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [
          petObject,
          getFlatObjectMetadataMock({
            universalIdentifier: 'unsupported-object',
            applicationId: APP_ID,
            applicationUniversalIdentifier: APP_UID,
            nameSingular: 'toy',
            namePlural: 'toys',
          }),
        ],
        frontComponents: [frontComponent],
        pageLayouts: [
          buildFlatPageLayout({ pageLayoutManifest: PET_PAGE_MANIFEST }),
        ],
        pageLayoutTabs: [
          buildFlatPageLayoutTab({
            pageLayoutTabManifest: OVERVIEW_TAB_MANIFEST,
            pageLayoutUniversalIdentifier: PET_PAGE_UID,
          }),
        ],
        pageLayoutWidgets: [
          buildFlatPageLayoutWidget({
            pageLayoutWidgetManifest: {
              ...buildNotesWidgetManifest('view-widget'),
              type: 'VIEW',
            },
            pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
          }),
          buildFlatPageLayoutWidget({
            pageLayoutWidgetManifest: buildNotesWidgetManifest(
              'unpositioned-widget',
            ),
            pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
            position: null,
          }),
          buildFlatPageLayoutWidget({
            pageLayoutWidgetManifest: {
              ...buildNotesWidgetManifest('grid-widget'),
              position: {
                layoutMode: PageLayoutTabLayoutMode.GRID,
                row: 0,
                column: 0,
                rowSpan: 4,
                columnSpan: 4,
              },
            },
            pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
          }),
          buildFlatPageLayoutWidget({
            pageLayoutWidgetManifest:
              buildNotesWidgetManifest('conditional-widget'),
            pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
            conditionalAvailabilityExpression: 'device === "mobile"',
          }),
          buildFlatPageLayoutWidget({
            pageLayoutWidgetManifest: {
              ...buildNotesWidgetManifest('missing-object-widget'),
              objectUniversalIdentifier: MISSING_UID,
            },
            pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
          }),
          buildFlatPageLayoutWidget({
            pageLayoutWidgetManifest: {
              ...FIELDS_WIDGET_MANIFEST,
              universalIdentifier: 'missing-view-widget',
              configuration: {
                configurationType: 'FIELDS',
                viewUniversalIdentifier: MISSING_UID,
                newFieldDefaultVisibility: true,
              },
            },
            pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
          }),
          buildFlatPageLayoutWidget({
            pageLayoutWidgetManifest: {
              ...buildNotesWidgetManifest('missing-field-widget'),
              type: 'FORM_FIELD',
              configuration: {
                configurationType: 'FORM_FIELD',
                fieldMetadataId: MISSING_UID,
              },
            },
            pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
          }),
          buildFlatPageLayoutWidget({
            pageLayoutWidgetManifest: {
              ...buildNotesWidgetManifest('chart-widget'),
              type: 'GRAPH',
              configuration: {
                configurationType: 'AGGREGATE_CHART',
                aggregateFieldMetadataUniversalIdentifier: null,
                aggregateOperation: AggregateOperations.COUNT,
              },
            },
            pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
          }),
          buildFlatPageLayoutWidget({
            pageLayoutWidgetManifest: {
              ...buildNotesWidgetManifest('grouped-chart-widget'),
              type: 'GRAPH',
              configuration: {
                configurationType: 'PIE_CHART',
                aggregateFieldMetadataUniversalIdentifier: NAME_FIELD_UID,
                aggregateOperation: AggregateOperations.COUNT,
                groupByFieldMetadataUniversalIdentifier: NAME_FIELD_UID,
              },
            },
            pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
          }),
          buildFlatPageLayoutWidget({
            pageLayoutWidgetManifest: {
              ...buildNotesWidgetManifest('unsupported-object-widget'),
              objectUniversalIdentifier: 'unsupported-object',
            },
            pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
          }),
          buildFlatPageLayoutWidget({
            pageLayoutWidgetManifest: {
              ...buildNotesWidgetManifest('owned-front-component-widget'),
              type: 'FRONT_COMPONENT',
              configuration: {
                configurationType: 'FRONT_COMPONENT',
                frontComponentUniversalIdentifier: FRONT_COMPONENT_UID,
              },
            },
            pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
          }),
          buildFlatPageLayoutWidget({
            pageLayoutWidgetManifest: buildNotesWidgetManifest(
              'unknown-reference-widget',
            ),
            pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
            universalConfiguration: {
              ...UNKNOWN_REFERENCE,
              configurationType: WidgetConfigurationType.NOTES,
            },
          }),
          buildFlatPageLayoutWidget({
            pageLayoutWidgetManifest: {
              ...buildNotesWidgetManifest('missing-front-component-widget'),
              type: 'FRONT_COMPONENT',
              configuration: {
                configurationType: 'FRONT_COMPONENT',
                frontComponentUniversalIdentifier: MISSING_UID,
              },
            },
            pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
          }),
        ],
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
    });

    expect(reasonOf(coverage, 'view-widget')).toBe(
      'page layout widget of the VIEW type, which the sync does not support yet',
    );
    expect(reasonOf(coverage, 'unpositioned-widget')).toBe(
      'page layout widget without a position',
    );
    expect(reasonOf(coverage, 'grid-widget')).toBe(
      'page layout widget positioned for another layout mode than its tab',
    );
    expect(reasonOf(coverage, 'conditional-widget')).toBe(
      'page layout widget with a conditional availability expression',
    );
    expect(reasonOf(coverage, 'missing-object-widget')).toBe(
      'page layout widget on an object that does not exist',
    );
    expect(reasonOf(coverage, 'missing-view-widget')).toBe(
      'page layout widget referencing a view that does not exist',
    );
    expect(reasonOf(coverage, 'missing-field-widget')).toBe(
      'page layout widget referencing a field that does not exist',
    );
    expect(reasonOf(coverage, 'chart-widget')).toBe(
      'page layout widget referencing a field that does not exist',
    );
    expect(reasonOf(coverage, 'unsupported-object-widget')).toBe(
      'page layout widget on an unsupported object',
    );
    expect(reasonOf(coverage, 'owned-front-component-widget')).toBe(
      'page layout widget referencing a front component that is not exported yet',
    );
    expect(reasonOf(coverage, 'missing-front-component-widget')).toBe(
      'page layout widget referencing a front component that does not exist',
    );
    expect(statusOf(coverage, 'grouped-chart-widget')?.status).toBe(
      ApplicationExportCoverageStatus.EXPORTED,
    );
    expect(reasonOf(coverage, 'unknown-reference-widget')).toBe(
      'page layout widget referencing metadata this export cannot resolve (workflowUniversalIdentifier)',
    );
  });

  it('should report exactly one coverage entry per input row', () => {
    const pageLayouts = [
      buildFlatPageLayout({ pageLayoutManifest: PET_PAGE_MANIFEST }),
      buildFlatPageLayout({
        pageLayoutManifest: ENGINE_PAGE_MANIFEST,
        isSystemSideEffect: true,
      }),
    ];
    const pageLayoutTabs = [
      buildFlatPageLayoutTab({
        pageLayoutTabManifest: OVERVIEW_TAB_MANIFEST,
        pageLayoutUniversalIdentifier: PET_PAGE_UID,
      }),
      buildFlatPageLayoutTab({
        pageLayoutTabManifest: {
          universalIdentifier: EXTRA_TAB_UID,
          title: 'Extra',
          position: 60,
        },
        pageLayoutUniversalIdentifier: ENGINE_PAGE_UID,
      }),
      buildFlatPageLayoutTab({
        pageLayoutTabManifest: {
          universalIdentifier: ENGINE_TAB_UID,
          title: 'Home',
          position: 10,
        },
        pageLayoutUniversalIdentifier: ENGINE_PAGE_UID,
        isSystemSideEffect: true,
      }),
    ];
    const pageLayoutWidgets = [
      buildFlatPageLayoutWidget({
        pageLayoutWidgetManifest: buildNotesWidgetManifest('nested-widget'),
        pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
      }),
      buildFlatPageLayoutWidget({
        pageLayoutWidgetManifest: buildNotesWidgetManifest('engine-widget'),
        pageLayoutTabUniversalIdentifier: ENGINE_TAB_UID,
        isSystemSideEffect: true,
      }),
      buildFlatPageLayoutWidget({
        pageLayoutWidgetManifest: buildNotesWidgetManifest(
          'unpositioned-widget',
        ),
        pageLayoutTabUniversalIdentifier: OVERVIEW_TAB_UID,
        position: null,
      }),
    ];
    const rows = [...pageLayouts, ...pageLayoutTabs, ...pageLayoutWidgets];

    const { coverage } = reconstructPageLayoutsManifest({
      applicationAllFlatEntityMaps: buildMaps({
        objects: [petObject],
        pageLayouts,
        pageLayoutTabs,
        pageLayoutWidgets,
      }),
      allFlatEntityMaps,
      exportedObjectUniversalIdentifiers: EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
    });

    expect(coverage).toHaveLength(rows.length);
    expect(
      coverage.map(({ universalIdentifier }) => universalIdentifier).sort(),
    ).toEqual(
      rows.map(({ universalIdentifier }) => universalIdentifier).sort(),
    );
  });
});
