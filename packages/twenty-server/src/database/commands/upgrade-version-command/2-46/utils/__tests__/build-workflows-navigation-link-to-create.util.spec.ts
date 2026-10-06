import { NavigationMenuItemType } from 'twenty-shared/types';

import { LEGACY_WORKFLOWS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-46/constants/legacy-workflow-object-universal-identifiers.constant';
import { buildWorkflowsNavigationLinkToCreate } from 'src/database/commands/upgrade-version-command/2-46/utils/build-workflows-navigation-link-to-create.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';

const NOW = '2026-10-06T10:00:00.000Z';

const LEGACY_WORKFLOWS_NAVIGATION_MENU_ITEM = {
  id: 'legacy-workflows-navigation-menu-item-id',
  universalIdentifier:
    LEGACY_WORKFLOWS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  applicationId: 'standard-application-id',
  workspaceId: 'workspace-id',
  userWorkspaceId: null,
  type: NavigationMenuItemType.OBJECT,
  name: null,
  link: null,
  icon: null,
  color: 'gray',
  targetRecordId: null,
  targetObjectMetadataId: 'legacy-workflow-object-id',
  targetObjectMetadataUniversalIdentifier:
    '20202020-62be-406c-b9ca-8caa50d51392',
  viewId: 'legacy-workflow-view-id',
  viewUniversalIdentifier: 'legacy-workflow-view',
  folderId: 'workflows-folder-id',
  folderUniversalIdentifier: '20202020-b007-4b07-8b07-c0aba11c0007',
  position: 3,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
} as unknown as FlatNavigationMenuItem;

describe('buildWorkflowsNavigationLinkToCreate', () => {
  it('builds the standard Workflows link where the legacy object item was', () => {
    const workflowsNavigationLink = buildWorkflowsNavigationLinkToCreate({
      legacyWorkflowsNavigationMenuItem: LEGACY_WORKFLOWS_NAVIGATION_MENU_ITEM,
      now: NOW,
    });

    expect(workflowsNavigationLink).toMatchObject({
      universalIdentifier:
        STANDARD_NAVIGATION_MENU_ITEMS.workflowsFolderAllWorkflows
          .universalIdentifier,
      type: NavigationMenuItemType.LINK,
      link: '/workflows',
      icon: 'IconSettingsAutomation',
      color: 'gray',
      folderId: 'workflows-folder-id',
      position: 3,
      targetObjectMetadataId: null,
      targetObjectMetadataUniversalIdentifier: null,
      viewId: null,
      viewUniversalIdentifier: null,
      createdAt: NOW,
    });
    expect(workflowsNavigationLink.id).not.toBe(
      LEGACY_WORKFLOWS_NAVIGATION_MENU_ITEM.id,
    );
  });

  it('keeps an icon the workspace chose', () => {
    expect(
      buildWorkflowsNavigationLinkToCreate({
        legacyWorkflowsNavigationMenuItem: {
          ...LEGACY_WORKFLOWS_NAVIGATION_MENU_ITEM,
          icon: 'IconRobot',
        },
        now: NOW,
      }).icon,
    ).toBe('IconRobot');
  });
});
