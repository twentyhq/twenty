import {
  DEFAULT_FRONT_COMPONENT_SETTINGS_TAB,
  type Manifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

// A manifest built before the tab moved onto the front component carries the
// application-level pointer and no settingsTab anywhere, so syncing one would
// otherwise clear the settings tab the application currently renders.
export const applyLegacySettingsFrontComponentTab = (
  manifest: Manifest,
): Manifest => {
  const legacySettingsFrontComponentUniversalIdentifier =
    manifest.application.settingsFrontComponent?.universalIdentifier;

  if (
    !isDefined(legacySettingsFrontComponentUniversalIdentifier) ||
    manifest.frontComponents.some(({ settingsTab }) => isDefined(settingsTab))
  ) {
    return manifest;
  }

  return {
    ...manifest,
    frontComponents: manifest.frontComponents.map((frontComponent) =>
      frontComponent.universalIdentifier ===
      legacySettingsFrontComponentUniversalIdentifier
        ? {
            ...frontComponent,
            settingsTab: { ...DEFAULT_FRONT_COMPONENT_SETTINGS_TAB },
          }
        : frontComponent,
    ),
  };
};
