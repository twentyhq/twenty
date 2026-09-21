import {
  DEFAULT_SETTING_PAGE_POSITION,
  DEFAULT_SETTING_PAGE_SCOPE,
  type SettingPageManifest,
} from 'twenty-shared/application';

import { type UniversalFlatSettingPage } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-setting-page.type';

export const fromSettingPageManifestToUniversalFlatSettingPage = ({
  settingPageManifest,
  applicationUniversalIdentifier,
  now,
}: {
  settingPageManifest: SettingPageManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatSettingPage => ({
  universalIdentifier: settingPageManifest.universalIdentifier,
  applicationUniversalIdentifier,
  frontComponentUniversalIdentifier:
    settingPageManifest.frontComponentUniversalIdentifier,
  title: settingPageManifest.title,
  icon: settingPageManifest.icon ?? null,
  position: settingPageManifest.position ?? DEFAULT_SETTING_PAGE_POSITION,
  scope: settingPageManifest.scope ?? DEFAULT_SETTING_PAGE_SCOPE,
  createdAt: now,
  updatedAt: now,
});
