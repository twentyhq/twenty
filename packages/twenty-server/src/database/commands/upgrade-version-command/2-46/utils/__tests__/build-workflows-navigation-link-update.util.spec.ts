import { NavigationMenuItemType } from 'twenty-shared/types';

import { WORKFLOWS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-46/constants/legacy-workflow-object-universal-identifiers.constant';
import { buildWorkflowsNavigationLinkUpdate } from 'src/database/commands/upgrade-version-command/2-46/utils/build-workflows-navigation-link-update.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';

const NOW = '2026-10-06T10:00:00.000Z';

const LEGACY_WORKFLOWS_NAVIGATION_MENU_ITEM = {
  id: 'workflows-navigation-menu-item-id',
  universalIdentifier: WORKFLOWS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.OBJECT,
  name: null,
  link: null,
  icon: null,
  targetObjectMetadataId: 'legacy-workflow-object-id',
  targetObjectMetadataUniversalIdentifier:
    '20202020-62be-406c-b9ca-8caa50d51392',
  viewId: 'legacy-workflow-view-id',
  viewUniversalIdentifier: 'legacy-workflow-view-universal-identifier',
  folderId: 'workflows-folder-id',
  position: 0,
  updatedAt: '2026-08-01T00:00:00.000Z',
} as unknown as FlatNavigationMenuItem;

describe('buildWorkflowsNavigationLinkUpdate', () => {
  it('turns the legacy Workflows object item into a link to the workflows page', () => {
    expect(
      buildWorkflowsNavigationLinkUpdate({
        flatNavigationMenuItemsByUniversalIdentifier: {
          [WORKFLOWS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER]:
            LEGACY_WORKFLOWS_NAVIGATION_MENU_ITEM,
        },
        now: NOW,
      }),
    ).toEqual({
      ...LEGACY_WORKFLOWS_NAVIGATION_MENU_ITEM,
      type: NavigationMenuItemType.LINK,
      name: 'Workflows',
      link: '/workflows',
      icon: 'IconSettingsAutomation',
      targetObjectMetadataId: null,
      targetObjectMetadataUniversalIdentifier: null,
      viewId: null,
      viewUniversalIdentifier: null,
      updatedAt: NOW,
    });
  });

  it('keeps an icon the workspace chose', () => {
    expect(
      buildWorkflowsNavigationLinkUpdate({
        flatNavigationMenuItemsByUniversalIdentifier: {
          [WORKFLOWS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER]: {
            ...LEGACY_WORKFLOWS_NAVIGATION_MENU_ITEM,
            icon: 'IconRobot',
          },
        },
        now: NOW,
      })?.icon,
    ).toBe('IconRobot');
  });

  it.each([
    { name: 'missing item', flatNavigationMenuItem: undefined },
    {
      name: 'item already a link',
      flatNavigationMenuItem: {
        ...LEGACY_WORKFLOWS_NAVIGATION_MENU_ITEM,
        type: NavigationMenuItemType.LINK,
        link: '/workflows',
      },
    },
  ])('returns nothing for a $name', ({ flatNavigationMenuItem }) => {
    expect(
      buildWorkflowsNavigationLinkUpdate({
        flatNavigationMenuItemsByUniversalIdentifier: {
          [WORKFLOWS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER]:
            flatNavigationMenuItem,
        },
        now: NOW,
      }),
    ).toBeUndefined();
  });
});
