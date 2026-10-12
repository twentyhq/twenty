import { type FrontComponentManifest } from 'twenty-shared/application';

import { fromFrontComponentManifestToUniversalFlatFrontComponent } from 'src/engine/core-modules/application/application-manifest/converters/from-front-component-manifest-to-universal-flat-front-component.util';

const APP_UID = 'a8a8a8a8-a8a8-4a8a-a8a8-a8a8a8a8a8a8';
const FRONT_COMPONENT_UID = 'f1f1f1f1-f1f1-4f1f-b1f1-f1f1f1f1f1f1';
const NOW = '2026-10-12T00:00:00.000Z';

const buildManifest = (
  overrides: Partial<FrontComponentManifest> = {},
): FrontComponentManifest => ({
  universalIdentifier: FRONT_COMPONENT_UID,
  name: 'My component',
  sourceComponentPath: 'src/my.front-component.tsx',
  builtComponentPath: 'src/my.front-component.mjs',
  builtComponentChecksum: 'checksum',
  componentName: 'MyComponent',
  ...overrides,
});

describe('fromFrontComponentManifestToUniversalFlatFrontComponent', () => {
  it('should keep a regular front component selectable as a widget by default', () => {
    const result = fromFrontComponentManifestToUniversalFlatFrontComponent({
      frontComponentManifest: buildManifest(),
      applicationUniversalIdentifier: APP_UID,
      isSettingsFrontComponent: false,
      isReferencedBySettingsMenuItem: false,
      now: NOW,
    });

    expect(result.excludeFromWidgetSelection).toBe(false);
  });

  it('should exclude a settings front component from widget selection by default', () => {
    const result = fromFrontComponentManifestToUniversalFlatFrontComponent({
      frontComponentManifest: buildManifest(),
      applicationUniversalIdentifier: APP_UID,
      isSettingsFrontComponent: true,
      isReferencedBySettingsMenuItem: false,
      now: NOW,
    });

    expect(result.excludeFromWidgetSelection).toBe(true);
  });

  it('should exclude a front component rendered by a settings menu item from widget selection by default', () => {
    const result = fromFrontComponentManifestToUniversalFlatFrontComponent({
      frontComponentManifest: buildManifest(),
      applicationUniversalIdentifier: APP_UID,
      isSettingsFrontComponent: false,
      isReferencedBySettingsMenuItem: true,
      now: NOW,
    });

    expect(result.excludeFromWidgetSelection).toBe(true);
  });

  it('should honor an explicit excludeFromWidgetSelection over the default', () => {
    const regularResult =
      fromFrontComponentManifestToUniversalFlatFrontComponent({
        frontComponentManifest: buildManifest({
          excludeFromWidgetSelection: true,
        }),
        applicationUniversalIdentifier: APP_UID,
        isSettingsFrontComponent: false,
        isReferencedBySettingsMenuItem: false,
        now: NOW,
      });

    const settingsResult =
      fromFrontComponentManifestToUniversalFlatFrontComponent({
        frontComponentManifest: buildManifest({
          excludeFromWidgetSelection: false,
        }),
        applicationUniversalIdentifier: APP_UID,
        isSettingsFrontComponent: true,
        isReferencedBySettingsMenuItem: true,
        now: NOW,
      });

    expect(regularResult.excludeFromWidgetSelection).toBe(true);
    expect(settingsResult.excludeFromWidgetSelection).toBe(false);
  });
});
