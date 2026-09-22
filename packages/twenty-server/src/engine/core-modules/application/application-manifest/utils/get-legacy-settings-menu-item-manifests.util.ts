import {
  getLegacySettingsMenuItemUniversalIdentifier,
  type Manifest,
  type SettingsMenuItemManifest,
} from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

const LEGACY_SETTINGS_MENU_ITEM_TITLE = 'Settings';
const LEGACY_SETTINGS_MENU_ITEM_ICON = 'IconAdjustments';

// An application built before defineSettingsMenuItem existed declares no page, only
// the deprecated settingsFrontComponent pointer. Without this, syncing such an
// application would find no page in its manifest and delete the one the upgrade
// backfilled, dropping the tab the application already renders.
export const getLegacySettingsMenuItemManifests = (
  manifest: Manifest,
): SettingsMenuItemManifest[] => {
  if (isNonEmptyArray(manifest.settingsMenuItems)) {
    return [];
  }

  const frontComponentUniversalIdentifier =
    manifest.application.settingsFrontComponent?.universalIdentifier;

  if (!isDefined(frontComponentUniversalIdentifier)) {
    return [];
  }

  return [
    {
      universalIdentifier: getLegacySettingsMenuItemUniversalIdentifier({
        applicationUniversalIdentifier:
          manifest.application.universalIdentifier,
        frontComponentUniversalIdentifier,
      }),
      frontComponentUniversalIdentifier,
      title: LEGACY_SETTINGS_MENU_ITEM_TITLE,
      icon: LEGACY_SETTINGS_MENU_ITEM_ICON,
    },
  ];
};
