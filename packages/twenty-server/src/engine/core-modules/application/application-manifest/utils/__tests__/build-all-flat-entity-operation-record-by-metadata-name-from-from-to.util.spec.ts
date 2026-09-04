import { PageLayoutType } from 'twenty-shared/types';

import { buildAllFlatEntityOperationRecordByMetadataNameFromFromTo } from 'src/engine/core-modules/application/application-manifest/utils/build-all-flat-entity-operation-record-by-metadata-name-from-from-to.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type FlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag.type';

const PAGE_LAYOUT: FlatPageLayout = {
  id: 'page-layout-id',
  universalIdentifier: 'page-layout-universal-identifier',
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-identifier',
  workspaceId: 'workspace-id',
  name: 'App page',
  type: PageLayoutType.RECORD_PAGE,
  objectMetadataId: null,
  objectMetadataUniversalIdentifier: null,
  defaultTabToFocusOnMobileAndSidePanelId: null,
  defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
  tabIds: [],
  tabUniversalIdentifiers: [],
  isSystemSideEffect: false,
  isFirstTabPinned: true,
  createdAt: '2026-08-27T00:00:00.000Z',
  updatedAt: '2026-08-27T00:00:00.000Z',
  deletedAt: null,
};

const BUILD_OPTIONS = {
  isSystemBuild: false,
  inferDeletionFromMissingEntities: true,
  applicationUniversalIdentifier: PAGE_LAYOUT.applicationUniversalIdentifier,
} as const;

const OBJECT_PERMISSION: FlatObjectPermission = {
  id: 'object-permission-id',
  universalIdentifier: 'object-permission-universal-identifier',
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-identifier',
  workspaceId: 'workspace-id',
  roleId: 'role-id',
  roleUniversalIdentifier: 'role-universal-identifier',
  objectMetadataId: 'object-metadata-id',
  objectMetadataUniversalIdentifier: 'object-metadata-universal-identifier',
  canReadObjectRecords: true,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
  createdAt: '2026-09-03T00:00:00.000Z',
  updatedAt: '2026-09-03T00:00:00.000Z',
};

const ROLE_PERMISSION_FLAG: FlatRolePermissionFlag = {
  id: 'role-permission-flag-id',
  universalIdentifier: 'role-permission-flag-universal-identifier',
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-identifier',
  workspaceId: 'workspace-id',
  roleId: 'role-id',
  roleUniversalIdentifier: 'role-universal-identifier',
  permissionFlagId: 'permission-flag-id',
  permissionFlagUniversalIdentifier: 'permission-flag-universal-identifier',
  createdAt: '2026-09-03T00:00:00.000Z',
  updatedAt: '2026-09-03T00:00:00.000Z',
};

const buildAllFlatEntityMapsWithObjectPermission = (
  objectPermission: FlatObjectPermission,
) => {
  const allFlatEntityMaps = createEmptyAllFlatEntityMaps();

  allFlatEntityMaps.flatObjectPermissionMaps =
    addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: objectPermission,
      flatEntityMaps: allFlatEntityMaps.flatObjectPermissionMaps,
    });

  return allFlatEntityMaps;
};

const buildAllFlatEntityMapsWithRolePermissionFlag = (
  rolePermissionFlag: FlatRolePermissionFlag,
) => {
  const allFlatEntityMaps = createEmptyAllFlatEntityMaps();

  allFlatEntityMaps.flatRolePermissionFlagMaps =
    addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: rolePermissionFlag,
      flatEntityMaps: allFlatEntityMaps.flatRolePermissionFlagMaps,
    });

  return allFlatEntityMaps;
};

const buildAllFlatEntityMapsWithPageLayout = (pageLayout: FlatPageLayout) => {
  const allFlatEntityMaps = createEmptyAllFlatEntityMaps();

  allFlatEntityMaps.flatPageLayoutMaps = addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity: pageLayout,
    flatEntityMaps: allFlatEntityMaps.flatPageLayoutMaps,
  });

  return allFlatEntityMaps;
};

describe('buildAllFlatEntityOperationRecordByMetadataNameFromFromTo', () => {
  it('does not update an unpinned layout when its manifest is unchanged', () => {
    const result = buildAllFlatEntityOperationRecordByMetadataNameFromFromTo({
      fromAllFlatEntityMaps: buildAllFlatEntityMapsWithPageLayout({
        ...PAGE_LAYOUT,
        isFirstTabPinned: false,
      }),
      toAllUniversalFlatEntityMaps:
        buildAllFlatEntityMapsWithPageLayout(PAGE_LAYOUT),
      buildOptions: BUILD_OPTIONS,
    });

    expect(result).toEqual({});
  });

  it('accepts app updates without replacing the workspace pin choice', () => {
    const result = buildAllFlatEntityOperationRecordByMetadataNameFromFromTo({
      fromAllFlatEntityMaps: buildAllFlatEntityMapsWithPageLayout({
        ...PAGE_LAYOUT,
        isFirstTabPinned: false,
      }),
      toAllUniversalFlatEntityMaps: buildAllFlatEntityMapsWithPageLayout({
        ...PAGE_LAYOUT,
        name: 'Updated app page',
      }),
      buildOptions: BUILD_OPTIONS,
    });

    expect(result.pageLayout?.flatEntityToUpdate).toEqual({
      [PAGE_LAYOUT.universalIdentifier]: {
        ...PAGE_LAYOUT,
        name: 'Updated app page',
        isFirstTabPinned: false,
      },
    });
  });

  it('uses the app default when creating a layout', () => {
    const result = buildAllFlatEntityOperationRecordByMetadataNameFromFromTo({
      fromAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
      toAllUniversalFlatEntityMaps:
        buildAllFlatEntityMapsWithPageLayout(PAGE_LAYOUT),
      buildOptions: BUILD_OPTIONS,
    });

    expect(result.pageLayout?.flatEntityToCreate).toEqual({
      [PAGE_LAYOUT.universalIdentifier]: PAGE_LAYOUT,
    });
  });

  it('updates a re-minted object permission instead of replacing the workspace row', () => {
    const result = buildAllFlatEntityOperationRecordByMetadataNameFromFromTo({
      fromAllFlatEntityMaps:
        buildAllFlatEntityMapsWithObjectPermission(OBJECT_PERMISSION),
      toAllUniversalFlatEntityMaps: buildAllFlatEntityMapsWithObjectPermission({
        ...OBJECT_PERMISSION,
        universalIdentifier: 'reminted-universal-identifier',
        canUpdateObjectRecords: true,
      }),
      buildOptions: BUILD_OPTIONS,
    });

    expect(result.objectPermission?.flatEntityToCreate).toEqual({});
    expect(result.objectPermission?.flatEntityToDelete).toEqual({});
    expect(result.objectPermission?.flatEntityToUpdate).toEqual({
      [OBJECT_PERMISSION.universalIdentifier]: expect.objectContaining({
        universalIdentifier: OBJECT_PERMISSION.universalIdentifier,
        canUpdateObjectRecords: true,
      }),
    });
  });

  it('sees no change in a re-minted role permission flag for the same role and flag', () => {
    const result = buildAllFlatEntityOperationRecordByMetadataNameFromFromTo({
      fromAllFlatEntityMaps:
        buildAllFlatEntityMapsWithRolePermissionFlag(ROLE_PERMISSION_FLAG),
      toAllUniversalFlatEntityMaps:
        buildAllFlatEntityMapsWithRolePermissionFlag({
          ...ROLE_PERMISSION_FLAG,
          universalIdentifier: 'reminted-universal-identifier',
        }),
      buildOptions: BUILD_OPTIONS,
    });

    expect(result).toEqual({});
  });
});
