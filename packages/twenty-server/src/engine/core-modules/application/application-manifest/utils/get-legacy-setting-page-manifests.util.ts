import {
  getLegacySettingPageUniversalIdentifier,
  type Manifest,
  type SettingPageManifest,
} from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

const LEGACY_SETTING_PAGE_TITLE = 'Variables';
const LEGACY_SETTING_PAGE_ICON = 'IconVariable';

// An application built before defineSettingPage existed declares no page, only
// the deprecated settingsFrontComponent pointer. Without this, syncing such an
// application would find no page in its manifest and delete the one the upgrade
// backfilled, dropping the tab the application already renders.
export const getLegacySettingPageManifests = (
  manifest: Manifest,
): SettingPageManifest[] => {
  if (isNonEmptyArray(manifest.settingPages)) {
    return [];
  }

  const frontComponentUniversalIdentifier =
    manifest.application.settingsFrontComponent?.universalIdentifier;

  if (!isDefined(frontComponentUniversalIdentifier)) {
    return [];
  }

  return [
    {
      universalIdentifier: getLegacySettingPageUniversalIdentifier({
        applicationUniversalIdentifier:
          manifest.application.universalIdentifier,
        frontComponentUniversalIdentifier,
      }),
      frontComponentUniversalIdentifier,
      title: LEGACY_SETTING_PAGE_TITLE,
      icon: LEGACY_SETTING_PAGE_ICON,
    },
  ];
};
