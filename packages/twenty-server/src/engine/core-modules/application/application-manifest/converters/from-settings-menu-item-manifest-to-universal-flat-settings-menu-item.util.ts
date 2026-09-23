import {
  DEFAULT_SETTINGS_MENU_ITEM_POSITION,
  DEFAULT_SETTINGS_MENU_ITEM_SCOPE,
  type SettingsMenuItemManifest,
} from 'twenty-shared/application';

import { type UniversalFlatSettingsMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-settings-menu-item.type';

export const fromSettingsMenuItemManifestToUniversalFlatSettingsMenuItem = ({
  settingsMenuItemManifest,
  applicationUniversalIdentifier,
  now,
}: {
  settingsMenuItemManifest: SettingsMenuItemManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatSettingsMenuItem => ({
  universalIdentifier: settingsMenuItemManifest.universalIdentifier,
  applicationUniversalIdentifier,
  frontComponentUniversalIdentifier:
    settingsMenuItemManifest.frontComponentUniversalIdentifier,
  title: settingsMenuItemManifest.title,
  icon: settingsMenuItemManifest.icon ?? null,
  position:
    settingsMenuItemManifest.position ?? DEFAULT_SETTINGS_MENU_ITEM_POSITION,
  scope: settingsMenuItemManifest.scope ?? DEFAULT_SETTINGS_MENU_ITEM_SCOPE,
  createdAt: now,
  updatedAt: now,
});
