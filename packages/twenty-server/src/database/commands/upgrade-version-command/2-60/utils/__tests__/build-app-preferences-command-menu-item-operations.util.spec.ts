import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';

import {
  APP_PREFERENCES_COMMAND_MENU_ITEM_FIELDS,
  buildAppPreferencesCommandMenuItemOperations,
  GO_TO_SETTINGS_ACCOUNTS_UNIVERSAL_IDENTIFIER,
  LEGACY_ACCOUNTS_PATH,
  LEGACY_PATH_BY_REMOVED_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/upgrade-version-command/2-60/utils/build-app-preferences-command-menu-item-operations.util';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const NOW = '2026-11-16T12:00:00.000Z';
const CREATED_AT = '2026-01-01T00:00:00.000Z';

const [EMAILS_UNIVERSAL_IDENTIFIER, CALENDARS_UNIVERSAL_IDENTIFIER] =
  Object.keys(LEGACY_PATH_BY_REMOVED_UNIVERSAL_IDENTIFIER);

const buildCommandMenuItem = ({
  universalIdentifier,
  path,
  applicationUniversalIdentifier = TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
}: {
  universalIdentifier: string;
  path: string;
  applicationUniversalIdentifier?: string;
}): FlatCommandMenuItem => ({
  workspaceId: '20202020-1111-4111-8111-111111111111',
  applicationId: '20202020-2222-4222-8222-222222222222',
  applicationUniversalIdentifier,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  id: universalIdentifier,
  universalIdentifier,
  label: 'Go to Accounts Settings',
  shortLabel: 'Accounts',
  icon: 'IconAt',
  position: 49,
  isPinned: false,
  isActive: true,
  isSystemSideEffect: false,
  engineComponentKey: EngineComponentKey.NAVIGATION,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
  conditionalAvailabilityExpression: 'permissionFlags.CONNECTED_ACCOUNTS',
  conditionalPinnedExpression: null,
  availabilityCoreObjectName: null,
  availabilityObjectMetadataId: null,
  availabilityObjectMetadataUniversalIdentifier: null,
  navigationTargetObjectMetadataId: null,
  navigationTargetObjectMetadataUniversalIdentifier: null,
  frontComponentId: null,
  frontComponentUniversalIdentifier: null,
  pageLayoutId: null,
  pageLayoutUniversalIdentifier: null,
  workflowVersionId: null,
  coreWorkflowVersionId: null,
  hotKeys: null,
  payload: { path },
  overrides: null,
  universalOverrides: null,
});

const LEGACY_ACCOUNTS_ITEM = buildCommandMenuItem({
  universalIdentifier: GO_TO_SETTINGS_ACCOUNTS_UNIVERSAL_IDENTIFIER,
  path: LEGACY_ACCOUNTS_PATH,
});
const LEGACY_EMAILS_ITEM = buildCommandMenuItem({
  universalIdentifier: EMAILS_UNIVERSAL_IDENTIFIER,
  path: '/settings/accounts/emails',
});
const LEGACY_CALENDARS_ITEM = buildCommandMenuItem({
  universalIdentifier: CALENDARS_UNIVERSAL_IDENTIFIER,
  path: '/settings/accounts/calendars',
});

const buildMaps = (commandMenuItems: FlatCommandMenuItem[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    commandMenuItems.map((commandMenuItem) => [
      commandMenuItem.universalIdentifier,
      commandMenuItem,
    ]),
  ),
});

describe('buildAppPreferencesCommandMenuItemOperations', () => {
  it('lands on the shipped standard Apps preferences command', () => {
    expect(STANDARD_COMMAND_MENU_ITEMS.goToSettingsAccounts).toMatchObject({
      universalIdentifier: GO_TO_SETTINGS_ACCOUNTS_UNIVERSAL_IDENTIFIER,
      ...APP_PREFERENCES_COMMAND_MENU_ITEM_FIELDS,
    });
  });

  it('no longer ships the Emails and Calendars commands', () => {
    const standardUniversalIdentifiers = Object.values(
      STANDARD_COMMAND_MENU_ITEMS,
    ).map((commandMenuItem) => commandMenuItem.universalIdentifier);

    expect(standardUniversalIdentifiers).not.toContain(
      EMAILS_UNIVERSAL_IDENTIFIER,
    );
    expect(standardUniversalIdentifiers).not.toContain(
      CALENDARS_UNIVERSAL_IDENTIFIER,
    );
  });

  it('points Accounts at Apps preferences and deletes Emails and Calendars', () => {
    expect(
      buildAppPreferencesCommandMenuItemOperations({
        flatCommandMenuItemMaps: buildMaps([
          LEGACY_ACCOUNTS_ITEM,
          LEGACY_EMAILS_ITEM,
          LEGACY_CALENDARS_ITEM,
        ]),
        now: NOW,
      }),
    ).toEqual({
      flatEntityToUpdate: [
        {
          ...LEGACY_ACCOUNTS_ITEM,
          ...APP_PREFERENCES_COMMAND_MENU_ITEM_FIELDS,
          updatedAt: NOW,
        },
      ],
      flatEntityToDelete: [LEGACY_EMAILS_ITEM, LEGACY_CALENDARS_ITEM],
    });
  });

  it('does nothing once the workspace is upgraded', () => {
    expect(
      buildAppPreferencesCommandMenuItemOperations({
        flatCommandMenuItemMaps: buildMaps([
          {
            ...LEGACY_ACCOUNTS_ITEM,
            ...APP_PREFERENCES_COMMAND_MENU_ITEM_FIELDS,
          },
        ]),
        now: NOW,
      }),
    ).toEqual({ flatEntityToUpdate: [], flatEntityToDelete: [] });
  });

  it('leaves items owned by another application untouched', () => {
    const otherApplicationUniversalIdentifier =
      '20202020-3333-4333-8333-333333333333';

    expect(
      buildAppPreferencesCommandMenuItemOperations({
        flatCommandMenuItemMaps: buildMaps([
          {
            ...LEGACY_ACCOUNTS_ITEM,
            applicationUniversalIdentifier: otherApplicationUniversalIdentifier,
          },
          {
            ...LEGACY_EMAILS_ITEM,
            applicationUniversalIdentifier: otherApplicationUniversalIdentifier,
          },
        ]),
        now: NOW,
      }),
    ).toEqual({ flatEntityToUpdate: [], flatEntityToDelete: [] });
  });
});
