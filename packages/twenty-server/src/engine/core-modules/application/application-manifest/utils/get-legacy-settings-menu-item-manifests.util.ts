import {
  getLegacySettingsMenuItemUniversalIdentifier,
  type Manifest,
  type SettingsMenuItemManifest,
} from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

// Deliberately not shared with the backfill command, which freezes what it wrote
// the day it ran: unifying the two would make a later edit here rewrite the value
// that command is meant to keep. Only the universalIdentifier has to agree, and
// getLegacySettingsMenuItemUniversalIdentifier is already the single source for it.
const LEGACY_SETTINGS_MENU_ITEM_TITLE = 'Settings';
const LEGACY_SETTINGS_MENU_ITEM_ICON = 'IconAdjustments';

// An application built before defineSettingsMenuItem existed declares no item, only
// the deprecated settingsFrontComponent pointer. Without this, syncing such an
// application would find no item in its manifest and delete the one the upgrade
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

  // The pre-install phase syncs the application with its legacy pointer intact but
  // with frontComponents emptied, so synthesizing there would point the item at a
  // component that phase never installs and fail the whole install.
  const manifestDeclaresFrontComponent = manifest.frontComponents.some(
    (frontComponent) =>
      frontComponent.universalIdentifier === frontComponentUniversalIdentifier,
  );

  if (!manifestDeclaresFrontComponent) {
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
