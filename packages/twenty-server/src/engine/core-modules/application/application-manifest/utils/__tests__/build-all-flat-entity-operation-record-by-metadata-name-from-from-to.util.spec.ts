import {
  CommandMenuItemAvailabilityType,
  NavigationMenuItemType,
  PageLayoutType,
} from 'twenty-shared/types';

import { buildAllFlatEntityOperationRecordByMetadataNameFromFromTo } from 'src/engine/core-modules/application/application-manifest/utils/build-all-flat-entity-operation-record-by-metadata-name-from-from-to.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'application-universal-identifier';

const SYNCABLE = {
  applicationId: 'application-id',
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  workspaceId: 'workspace-id',
  createdAt: '2026-08-27T00:00:00.000Z',
  updatedAt: '2026-08-27T00:00:00.000Z',
} as const;

const PAGE_LAYOUT: FlatPageLayout = {
  ...SYNCABLE,
  id: 'page-layout-id',
  universalIdentifier: 'page-layout-universal-identifier',
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
  deletedAt: null,
};

const ROLE_TARGET: FlatRoleTarget = {
  ...SYNCABLE,
  id: 'role-target-id',
  universalIdentifier: 'role-target-universal-identifier',
  roleId: 'role-id',
  roleUniversalIdentifier: 'role-universal-identifier',
  userWorkspaceId: null,
  agentId: null,
  agentUniversalIdentifier: null,
  apiKeyId: null,
};

const WEBHOOK: FlatWebhook = {
  ...SYNCABLE,
  id: 'webhook-id',
  universalIdentifier: 'webhook-universal-identifier',
  targetUrl: 'https://example.com/hook',
  operations: ['*.*'],
  description: null,
  secret: 'webhook-secret',
  deletedAt: null,
};

const COMMAND_MENU_ITEM: FlatCommandMenuItem = {
  ...SYNCABLE,
  id: 'command-menu-item-id',
  universalIdentifier: 'command-menu-item-universal-identifier',
  workflowVersionId: null,
  frontComponentId: null,
  frontComponentUniversalIdentifier: null,
  engineComponentKey: EngineComponentKey.NAVIGATION,
  label: 'App command',
  icon: null,
  shortLabel: null,
  position: 0,
  isPinned: false,
  isActive: true,
  overrides: null,
  universalOverrides: null,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
  payload: null,
  hotKeys: null,
  conditionalAvailabilityExpression: null,
  conditionalPinnedExpression: null,
  availabilityObjectMetadataId: null,
  availabilityObjectMetadataUniversalIdentifier: null,
  navigationTargetObjectMetadataId: null,
  navigationTargetObjectMetadataUniversalIdentifier: null,
  pageLayoutId: null,
  pageLayoutUniversalIdentifier: null,
  isSystemSideEffect: false,
};

const NAVIGATION_MENU_ITEM: FlatNavigationMenuItem = {
  ...SYNCABLE,
  id: 'navigation-menu-item-id',
  universalIdentifier: 'navigation-menu-item-universal-identifier',
  userWorkspaceId: null,
  targetRecordId: null,
  targetObjectMetadataId: null,
  targetObjectMetadataUniversalIdentifier: null,
  viewId: null,
  viewUniversalIdentifier: null,
  type: NavigationMenuItemType.LINK,
  name: 'App link',
  link: 'https://example.com',
  icon: null,
  color: null,
  folderId: null,
  folderUniversalIdentifier: null,
  pageLayoutId: null,
  pageLayoutUniversalIdentifier: null,
  position: 0,
};

const BUILD_OPTIONS = {
  isSystemBuild: false,
  inferDeletionFromMissingEntities: true,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
} as const;

const buildAllFlatEntityMapsWithPageLayout = (pageLayout: FlatPageLayout) => {
  const allFlatEntityMaps = createEmptyAllFlatEntityMaps();

  allFlatEntityMaps.flatPageLayoutMaps = addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity: pageLayout,
    flatEntityMaps: allFlatEntityMaps.flatPageLayoutMaps,
  });

  return allFlatEntityMaps;
};

const inferDeletionOf = (
  buildFromAllFlatEntityMaps: (
    allFlatEntityMaps: AllFlatEntityMaps,
  ) => AllFlatEntityMaps,
) =>
  buildAllFlatEntityOperationRecordByMetadataNameFromFromTo({
    fromAllFlatEntityMaps: buildFromAllFlatEntityMaps(
      createEmptyAllFlatEntityMaps(),
    ),
    toAllUniversalFlatEntityMaps: createEmptyAllFlatEntityMaps(),
    buildOptions: BUILD_OPTIONS,
  });

const withRoleTarget =
  (flatRoleTarget: FlatRoleTarget) =>
  (allFlatEntityMaps: AllFlatEntityMaps) => ({
    ...allFlatEntityMaps,
    flatRoleTargetMaps: addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatRoleTarget,
      flatEntityMaps: allFlatEntityMaps.flatRoleTargetMaps,
    }),
  });

const withWebhook =
  (flatWebhook: FlatWebhook) => (allFlatEntityMaps: AllFlatEntityMaps) => ({
    ...allFlatEntityMaps,
    flatWebhookMaps: addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatWebhook,
      flatEntityMaps: allFlatEntityMaps.flatWebhookMaps,
    }),
  });

const withCommandMenuItem =
  (flatCommandMenuItem: FlatCommandMenuItem) =>
  (allFlatEntityMaps: AllFlatEntityMaps) => ({
    ...allFlatEntityMaps,
    flatCommandMenuItemMaps: addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatCommandMenuItem,
      flatEntityMaps: allFlatEntityMaps.flatCommandMenuItemMaps,
    }),
  });

const withNavigationMenuItem =
  (flatNavigationMenuItem: FlatNavigationMenuItem) =>
  (allFlatEntityMaps: AllFlatEntityMaps) => ({
    ...allFlatEntityMaps,
    flatNavigationMenuItemMaps: addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatNavigationMenuItem,
      flatEntityMaps: allFlatEntityMaps.flatNavigationMenuItemMaps,
    }),
  });

describe('buildAllFlatEntityOperationRecordByMetadataNameFromFromTo', () => {
  it('does not delete a member role assignment the manifest cannot express', () => {
    const result = inferDeletionOf(
      withRoleTarget({
        ...ROLE_TARGET,
        userWorkspaceId: 'a-member-user-workspace-id',
      }),
    );

    expect(result.roleTarget?.flatEntityToDelete).toBeUndefined();
  });

  it('does not delete an API key role assignment the manifest cannot express', () => {
    const result = inferDeletionOf(
      withRoleTarget({ ...ROLE_TARGET, apiKeyId: 'an-api-key-id' }),
    );

    expect(result.roleTarget?.flatEntityToDelete).toBeUndefined();
  });

  it('still deletes a role assignment that is not bound to a member or an API key', () => {
    const result = inferDeletionOf(
      withRoleTarget({ ...ROLE_TARGET, agentId: 'an-agent-id' }),
    );

    expect(
      result.roleTarget?.flatEntityToDelete?.[ROLE_TARGET.universalIdentifier],
    ).toBeDefined();
  });

  it('does not delete a webhook the manifest cannot express', () => {
    const result = inferDeletionOf(withWebhook(WEBHOOK));

    expect(result.webhook?.flatEntityToDelete).toBeUndefined();
  });

  it('does not delete a workflow trigger command the manifest cannot express', () => {
    const result = inferDeletionOf(
      withCommandMenuItem({
        ...COMMAND_MENU_ITEM,
        engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
        workflowVersionId: 'a-workflow-version-id',
      }),
    );

    expect(result.commandMenuItem?.flatEntityToDelete).toBeUndefined();
  });

  it('does not delete a command without the front component its manifest requires', () => {
    const result = inferDeletionOf(withCommandMenuItem(COMMAND_MENU_ITEM));

    expect(result.commandMenuItem?.flatEntityToDelete).toBeUndefined();
  });

  it('still deletes a command the manifest can express', () => {
    const result = inferDeletionOf(
      withCommandMenuItem({
        ...COMMAND_MENU_ITEM,
        engineComponentKey: EngineComponentKey.FRONT_COMPONENT_RENDERER,
        frontComponentId: 'a-front-component-id',
        frontComponentUniversalIdentifier:
          'a-front-component-universal-identifier',
      }),
    );

    expect(
      result.commandMenuItem?.flatEntityToDelete?.[
        COMMAND_MENU_ITEM.universalIdentifier
      ],
    ).toBeDefined();
  });

  it('does not delete a personal navigation item the manifest cannot express', () => {
    const result = inferDeletionOf(
      withNavigationMenuItem({
        ...NAVIGATION_MENU_ITEM,
        userWorkspaceId: 'a-member-user-workspace-id',
      }),
    );

    expect(result.navigationMenuItem?.flatEntityToDelete).toBeUndefined();
  });

  it('does not delete a record pinned navigation item the manifest cannot express', () => {
    const result = inferDeletionOf(
      withNavigationMenuItem({
        ...NAVIGATION_MENU_ITEM,
        targetRecordId: 'a-record-id',
      }),
    );

    expect(result.navigationMenuItem?.flatEntityToDelete).toBeUndefined();
  });

  it('still deletes a workspace navigation item', () => {
    const result = inferDeletionOf(
      withNavigationMenuItem(NAVIGATION_MENU_ITEM),
    );

    expect(
      result.navigationMenuItem?.flatEntityToDelete?.[
        NAVIGATION_MENU_ITEM.universalIdentifier
      ],
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
