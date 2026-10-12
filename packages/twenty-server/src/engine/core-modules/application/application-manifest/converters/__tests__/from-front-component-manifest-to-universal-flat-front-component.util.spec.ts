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
  it('should make a regular front component available on objects and dashboards by default', () => {
    const result = fromFrontComponentManifestToUniversalFlatFrontComponent({
      frontComponentManifest: buildManifest(),
      applicationUniversalIdentifier: APP_UID,
      isSettingsFrontComponent: false,
      isReferencedBySettingsMenuItem: false,
      now: NOW,
    });

    expect(result.availableOn).toEqual(['OBJECTS', 'DASHBOARDS']);
  });

  it('should make a settings front component available on settings only by default', () => {
    const result = fromFrontComponentManifestToUniversalFlatFrontComponent({
      frontComponentManifest: buildManifest(),
      applicationUniversalIdentifier: APP_UID,
      isSettingsFrontComponent: true,
      isReferencedBySettingsMenuItem: false,
      now: NOW,
    });

    expect(result.availableOn).toEqual(['SETTINGS']);
  });

  it('should make a front component rendered by a settings menu item available on settings only by default', () => {
    const result = fromFrontComponentManifestToUniversalFlatFrontComponent({
      frontComponentManifest: buildManifest(),
      applicationUniversalIdentifier: APP_UID,
      isSettingsFrontComponent: false,
      isReferencedBySettingsMenuItem: true,
      now: NOW,
    });

    expect(result.availableOn).toEqual(['SETTINGS']);
  });

  it('should honor an explicit availableOn over the default', () => {
    const regularResult =
      fromFrontComponentManifestToUniversalFlatFrontComponent({
        frontComponentManifest: buildManifest({
          availableOn: ['DASHBOARDS'],
        }),
        applicationUniversalIdentifier: APP_UID,
        isSettingsFrontComponent: false,
        isReferencedBySettingsMenuItem: false,
        now: NOW,
      });

    const settingsResult =
      fromFrontComponentManifestToUniversalFlatFrontComponent({
        frontComponentManifest: buildManifest({
          availableOn: ['SETTINGS', 'OBJECTS'],
        }),
        applicationUniversalIdentifier: APP_UID,
        isSettingsFrontComponent: true,
        isReferencedBySettingsMenuItem: true,
        now: NOW,
      });

    expect(regularResult.availableOn).toEqual(['DASHBOARDS']);
    expect(settingsResult.availableOn).toEqual(['SETTINGS', 'OBJECTS']);
  });
});
