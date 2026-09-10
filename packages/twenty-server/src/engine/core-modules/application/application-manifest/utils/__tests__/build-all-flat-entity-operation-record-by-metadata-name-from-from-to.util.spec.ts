import { PageLayoutType } from 'twenty-shared/types';

import { buildAllFlatEntityOperationRecordByMetadataNameFromFromTo } from 'src/engine/core-modules/application/application-manifest/utils/build-all-flat-entity-operation-record-by-metadata-name-from-from-to.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';

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

const buildAllFlatEntityMapsWithPageLayout = (pageLayout: FlatPageLayout) => {
  const allFlatEntityMaps = createEmptyAllFlatEntityMaps();

  allFlatEntityMaps.flatPageLayoutMaps = addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity: pageLayout,
    flatEntityMaps: allFlatEntityMaps.flatPageLayoutMaps,
  });

  return allFlatEntityMaps;
};

const buildAllFlatEntityMapsWithRoleTarget = (roleTarget: FlatRoleTarget) => {
  const allFlatEntityMaps = createEmptyAllFlatEntityMaps();

  allFlatEntityMaps.flatRoleTargetMaps = addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity: roleTarget,
    flatEntityMaps: allFlatEntityMaps.flatRoleTargetMaps,
  });

  return allFlatEntityMaps;
};

const ROLE_TARGET = {
  id: 'role-target-id',
  universalIdentifier: 'role-target-universal-identifier',
  applicationId: 'application-id',
  applicationUniversalIdentifier: PAGE_LAYOUT.applicationUniversalIdentifier,
  workspaceId: 'workspace-id',
  roleId: 'role-id',
  roleUniversalIdentifier: 'role-universal-identifier',
  userWorkspaceId: null,
  agentId: null,
  apiKeyId: null,
  createdAt: '2026-08-27T00:00:00.000Z',
  updatedAt: '2026-08-27T00:00:00.000Z',
  deletedAt: null,
} as unknown as FlatRoleTarget;

describe('buildAllFlatEntityOperationRecordByMetadataNameFromFromTo', () => {
  it('does not delete a role assignment the manifest cannot express', () => {
    const result = buildAllFlatEntityOperationRecordByMetadataNameFromFromTo({
      fromAllFlatEntityMaps: buildAllFlatEntityMapsWithRoleTarget({
        ...ROLE_TARGET,
        userWorkspaceId: 'a-member-user-workspace-id',
      } as FlatRoleTarget),
      toAllUniversalFlatEntityMaps: createEmptyAllFlatEntityMaps(),
      buildOptions: BUILD_OPTIONS,
    });

    expect(result.roleTarget?.flatEntityToDelete).toBeUndefined();
  });

  it('still deletes a role assignment that is not bound to a member or an API key', () => {
    const result = buildAllFlatEntityOperationRecordByMetadataNameFromFromTo({
      fromAllFlatEntityMaps: buildAllFlatEntityMapsWithRoleTarget({
        ...ROLE_TARGET,
        agentId: 'an-agent-id',
      } as FlatRoleTarget),
      toAllUniversalFlatEntityMaps: createEmptyAllFlatEntityMaps(),
      buildOptions: BUILD_OPTIONS,
    });

    expect(
      result.roleTarget?.flatEntityToDelete?.[ROLE_TARGET.universalIdentifier],
    ).toBeDefined();
  });

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
});
