import { NavigationMenuItemType } from 'twenty-shared/types';

import { fromNavigationMenuItemManifestToUniversalFlatNavigationMenuItem } from 'src/engine/core-modules/application/application-manifest/converters/from-navigation-menu-item-manifest-to-universal-flat-navigation-menu-item.util';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { reconstructNavigationMenuItemsManifest } from 'src/engine/core-modules/application/application-manifest/utils/reconstruct-navigation-menu-items-manifest.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

const APP_ID = 'application-id';
const WORKSPACE_ID = 'workspace-id';
const NOW = '2026-09-09T10:00:00.000Z';
const APP_UID = '11111111-1111-4111-8111-111111111111';
const PET_UID = '22222222-2222-4222-8222-222222222222';
const UNSUPPORTED_OBJECT_UID = '33333333-3333-4333-8333-333333333333';
const MISSING_UID = '44444444-4444-4444-8444-444444444444';
const VIEW_UID = '55555555-5555-4555-8555-555555555555';
const PAGE_LAYOUT_UID = '66666666-6666-4666-8666-666666666666';
const UNSUPPORTED_VIEW_UID = '77777777-7777-4777-8777-777777777777';
const UNSUPPORTED_PAGE_LAYOUT_UID = '88888888-8888-4888-8888-888888888888';
const ENGINE_VIEW_UID = '99999999-9999-4999-8999-999999999999';
const FOLDER_UID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const NESTED_FOLDER_UID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS = new Set([PET_UID]);

const petObject = getFlatObjectMetadataMock({
  universalIdentifier: PET_UID,
  applicationId: APP_ID,
  applicationUniversalIdentifier: APP_UID,
  nameSingular: 'pet',
  namePlural: 'pets',
});

const unsupportedObject = getFlatObjectMetadataMock({
  universalIdentifier: UNSUPPORTED_OBJECT_UID,
  applicationId: APP_ID,
  applicationUniversalIdentifier: APP_UID,
  nameSingular: 'toy',
  namePlural: 'toys',
});

const buildFlatNavigationMenuItem = ({
  universalIdentifier,
  type = NavigationMenuItemType.OBJECT,
  position = 0,
  ...flatNavigationMenuItemProperties
}: {
  universalIdentifier: string;
  type?: NavigationMenuItemType;
  position?: number;
} & Partial<FlatNavigationMenuItem>): FlatNavigationMenuItem => ({
  ...fromNavigationMenuItemManifestToUniversalFlatNavigationMenuItem({
    navigationMenuItemManifest: { universalIdentifier, type, position },
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  }),
  id: `${universalIdentifier}-id`,
  workspaceId: WORKSPACE_ID,
  applicationId: APP_ID,
  viewId: null,
  folderId: null,
  targetObjectMetadataId: null,
  pageLayoutId: null,
  ...flatNavigationMenuItemProperties,
});

const buildMaps = ({
  objects = [],
  views = [],
  pageLayouts = [],
  navigationMenuItems = [],
}: {
  objects?: FlatObjectMetadata[];
  views?: FlatView[];
  pageLayouts?: FlatPageLayout[];
  navigationMenuItems?: FlatNavigationMenuItem[];
}): AllFlatEntityMaps => {
  const maps = createEmptyAllFlatEntityMaps();

  return {
    ...maps,
    flatObjectMetadataMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: objects,
      flatEntityMaps: maps.flatObjectMetadataMaps,
    }),
    flatViewMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: views,
      flatEntityMaps: maps.flatViewMaps,
    }),
    flatPageLayoutMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: pageLayouts,
      flatEntityMaps: maps.flatPageLayoutMaps,
    }),
    flatNavigationMenuItemMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: navigationMenuItems,
      flatEntityMaps: maps.flatNavigationMenuItemMaps,
    }),
  };
};

const allFlatEntityMaps = buildMaps({
  objects: [petObject, unsupportedObject],
  views: [
    { universalIdentifier: VIEW_UID } as FlatView,
    { universalIdentifier: UNSUPPORTED_VIEW_UID } as FlatView,
    { universalIdentifier: ENGINE_VIEW_UID } as FlatView,
  ],
  pageLayouts: [
    { universalIdentifier: PAGE_LAYOUT_UID } as FlatPageLayout,
    { universalIdentifier: UNSUPPORTED_PAGE_LAYOUT_UID } as FlatPageLayout,
  ],
});

const reconstruct = (
  navigationMenuItems: FlatNavigationMenuItem[],
  applicationViews: FlatView[] = [],
  applicationPageLayouts: FlatPageLayout[] = [],
) =>
  reconstructNavigationMenuItemsManifest({
    applicationAllFlatEntityMaps: buildMaps({
      objects: [petObject, unsupportedObject],
      views: applicationViews,
      pageLayouts: applicationPageLayouts,
      navigationMenuItems,
    }),
    allFlatEntityMaps,
    exportedObjectUniversalIdentifiers: EXPORTED_OBJECT_UNIVERSAL_IDENTIFIERS,
    exportedViewUniversalIdentifiers: new Set([VIEW_UID]),
    exportedPageLayoutUniversalIdentifiers: new Set([PAGE_LAYOUT_UID]),
  });

const statusOf = (
  coverage: ReturnType<
    typeof reconstructNavigationMenuItemsManifest
  >['coverage'],
  universalIdentifier: string,
) =>
  coverage.find((entry) => entry.universalIdentifier === universalIdentifier);

describe('reconstructNavigationMenuItemsManifest', () => {
  it('should export an item with only the properties the workspace set, ordered by universal identifier', () => {
    const { navigationMenuItems, coverage } = reconstruct([
      buildFlatNavigationMenuItem({
        universalIdentifier: 'zzzzzzzz-zzzz-4zzz-8zzz-zzzzzzzzzzzz',
        position: 1,
        targetObjectMetadataUniversalIdentifier: PET_UID,
      }),
      buildFlatNavigationMenuItem({
        universalIdentifier: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        type: NavigationMenuItemType.VIEW,
        position: 2,
        name: 'All pets',
        icon: 'IconPaw',
        viewUniversalIdentifier: VIEW_UID,
      }),
    ]);

    expect(navigationMenuItems).toEqual([
      {
        universalIdentifier: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        type: NavigationMenuItemType.VIEW,
        position: 2,
        name: 'All pets',
        icon: 'IconPaw',
        viewUniversalIdentifier: VIEW_UID,
      },
      {
        universalIdentifier: 'zzzzzzzz-zzzz-4zzz-8zzz-zzzzzzzzzzzz',
        type: NavigationMenuItemType.OBJECT,
        position: 1,
        targetObjectUniversalIdentifier: PET_UID,
      },
    ]);
    expect(
      coverage.every(
        ({ status }) => status === ApplicationExportCoverageStatus.EXPORTED,
      ),
    ).toBe(true);
  });

  it('should exclude a personal favourite and an item pinned to a record', () => {
    const { navigationMenuItems, coverage } = reconstruct([
      buildFlatNavigationMenuItem({
        universalIdentifier: 'personal-item',
        targetObjectMetadataUniversalIdentifier: PET_UID,
        userWorkspaceId: 'user-workspace-id',
      }),
      buildFlatNavigationMenuItem({
        universalIdentifier: 'record-item',
        type: NavigationMenuItemType.RECORD,
        targetObjectMetadataUniversalIdentifier: PET_UID,
        targetRecordId: 'record-id',
      }),
    ]);

    expect(navigationMenuItems).toEqual([]);
    expect(statusOf(coverage, 'personal-item')).toEqual({
      metadataName: 'navigationMenuItem',
      universalIdentifier: 'personal-item',
      status: ApplicationExportCoverageStatus.EXCLUDED,
      reason: 'personal navigation item',
    });
    expect(statusOf(coverage, 'record-item')).toEqual({
      metadataName: 'navigationMenuItem',
      universalIdentifier: 'record-item',
      status: ApplicationExportCoverageStatus.EXCLUDED,
      reason: 'navigation item pinned to a record',
    });
  });

  it('should refuse an item whose target cannot be resolved', () => {
    const { navigationMenuItems, coverage } = reconstruct([
      buildFlatNavigationMenuItem({
        universalIdentifier: 'unsupported-object-item',
        targetObjectMetadataUniversalIdentifier: UNSUPPORTED_OBJECT_UID,
      }),
      buildFlatNavigationMenuItem({
        universalIdentifier: 'missing-object-item',
        targetObjectMetadataUniversalIdentifier: MISSING_UID,
      }),
      buildFlatNavigationMenuItem({
        universalIdentifier: 'missing-view-item',
        type: NavigationMenuItemType.VIEW,
        viewUniversalIdentifier: MISSING_UID,
      }),
      buildFlatNavigationMenuItem({
        universalIdentifier: 'missing-page-layout-item',
        type: NavigationMenuItemType.PAGE_LAYOUT,
        pageLayoutUniversalIdentifier: MISSING_UID,
      }),
    ]);

    expect(navigationMenuItems).toEqual([]);
    expect(statusOf(coverage, 'unsupported-object-item')?.reason).toBe(
      'navigation menu item on an unsupported object',
    );
    expect(statusOf(coverage, 'missing-object-item')?.reason).toBe(
      'navigation menu item on an object that does not exist',
    );
    expect(statusOf(coverage, 'missing-view-item')?.reason).toBe(
      'navigation menu item on a view that does not exist',
    );
    expect(statusOf(coverage, 'missing-page-layout-item')?.reason).toBe(
      'navigation menu item on a page layout that does not exist',
    );
  });

  it('should refuse an item pointing at a view or a page layout the application did not export, and keep one pointing at a target it does not own', () => {
    const { navigationMenuItems, coverage } = reconstruct(
      [
        buildFlatNavigationMenuItem({
          universalIdentifier: 'unsupported-view-item',
          type: NavigationMenuItemType.VIEW,
          viewUniversalIdentifier: UNSUPPORTED_VIEW_UID,
        }),
        buildFlatNavigationMenuItem({
          universalIdentifier: 'unsupported-page-layout-item',
          type: NavigationMenuItemType.PAGE_LAYOUT,
          pageLayoutUniversalIdentifier: UNSUPPORTED_PAGE_LAYOUT_UID,
        }),
        buildFlatNavigationMenuItem({
          universalIdentifier: 'engine-derived-view-item',
          type: NavigationMenuItemType.VIEW,
          viewUniversalIdentifier: ENGINE_VIEW_UID,
        }),
      ],
      [{ universalIdentifier: UNSUPPORTED_VIEW_UID } as FlatView],
      [{ universalIdentifier: UNSUPPORTED_PAGE_LAYOUT_UID } as FlatPageLayout],
    );

    expect(statusOf(coverage, 'unsupported-view-item')?.reason).toBe(
      'navigation menu item on an unsupported view',
    );
    expect(statusOf(coverage, 'unsupported-page-layout-item')?.reason).toBe(
      'navigation menu item on an unsupported page layout',
    );
    expect(
      navigationMenuItems.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(['engine-derived-view-item']);
  });

  it('should export a folder with the items it holds', () => {
    const { navigationMenuItems } = reconstruct([
      buildFlatNavigationMenuItem({
        universalIdentifier: FOLDER_UID,
        type: NavigationMenuItemType.FOLDER,
        name: 'Pets',
      }),
      buildFlatNavigationMenuItem({
        universalIdentifier: 'folded-item',
        targetObjectMetadataUniversalIdentifier: PET_UID,
        folderUniversalIdentifier: FOLDER_UID,
      }),
    ]);

    expect(
      navigationMenuItems.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual([FOLDER_UID, 'folded-item']);
  });

  it('should drop the items of a folder that is not exported, down the nesting', () => {
    const { navigationMenuItems, coverage } = reconstruct([
      buildFlatNavigationMenuItem({
        universalIdentifier: FOLDER_UID,
        type: NavigationMenuItemType.FOLDER,
        name: 'Toys',
        targetObjectMetadataUniversalIdentifier: UNSUPPORTED_OBJECT_UID,
      }),
      buildFlatNavigationMenuItem({
        universalIdentifier: NESTED_FOLDER_UID,
        type: NavigationMenuItemType.FOLDER,
        name: 'Soft toys',
        folderUniversalIdentifier: FOLDER_UID,
      }),
      buildFlatNavigationMenuItem({
        universalIdentifier: 'nested-item',
        targetObjectMetadataUniversalIdentifier: PET_UID,
        folderUniversalIdentifier: NESTED_FOLDER_UID,
      }),
    ]);

    expect(navigationMenuItems).toEqual([]);
    expect(statusOf(coverage, FOLDER_UID)?.reason).toBe(
      'navigation menu item on an unsupported object',
    );
    expect(statusOf(coverage, NESTED_FOLDER_UID)?.reason).toBe(
      'navigation menu item in a folder that is not exported',
    );
    expect(statusOf(coverage, 'nested-item')?.reason).toBe(
      'navigation menu item in a folder that is not exported',
    );
  });
});
