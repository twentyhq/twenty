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
  it('should offer a front component in both widget pickers by default', () => {
    const result = fromFrontComponentManifestToUniversalFlatFrontComponent({
      frontComponentManifest: buildManifest(),
      applicationUniversalIdentifier: APP_UID,
      isSettingsFrontComponent: false,
      isReferencedByCommandMenuItem: false,
      now: NOW,
    });

    expect(result.availableOn).toEqual(['OBJECTS', 'DASHBOARDS']);
  });

  it('should keep the settings front component out of the widget pickers by default', () => {
    const result = fromFrontComponentManifestToUniversalFlatFrontComponent({
      frontComponentManifest: buildManifest(),
      applicationUniversalIdentifier: APP_UID,
      isSettingsFrontComponent: true,
      isReferencedByCommandMenuItem: false,
      now: NOW,
    });

    expect(result.availableOn).toEqual([]);
  });

  it('should keep a front component opened from a command menu item out of the widget pickers by default', () => {
    const result = fromFrontComponentManifestToUniversalFlatFrontComponent({
      frontComponentManifest: buildManifest(),
      applicationUniversalIdentifier: APP_UID,
      isSettingsFrontComponent: false,
      isReferencedByCommandMenuItem: true,
      now: NOW,
    });

    expect(result.availableOn).toEqual([]);
  });

  it('should keep a headless front component out of the widget pickers by default', () => {
    const result = fromFrontComponentManifestToUniversalFlatFrontComponent({
      frontComponentManifest: buildManifest({ isHeadless: true }),
      applicationUniversalIdentifier: APP_UID,
      isSettingsFrontComponent: false,
      isReferencedByCommandMenuItem: false,
      now: NOW,
    });

    expect(result.availableOn).toEqual([]);
  });

  it('should honor an explicit availableOn over the default', () => {
    const regularResult =
      fromFrontComponentManifestToUniversalFlatFrontComponent({
        frontComponentManifest: buildManifest({
          availableOn: [],
        }),
        applicationUniversalIdentifier: APP_UID,
        isSettingsFrontComponent: false,
        isReferencedByCommandMenuItem: false,
        now: NOW,
      });

    const menuItemResult =
      fromFrontComponentManifestToUniversalFlatFrontComponent({
        frontComponentManifest: buildManifest({
          availableOn: ['DASHBOARDS'],
        }),
        applicationUniversalIdentifier: APP_UID,
        isSettingsFrontComponent: true,
        isReferencedByCommandMenuItem: true,
        now: NOW,
      });

    expect(regularResult.availableOn).toEqual([]);
    expect(menuItemResult.availableOn).toEqual(['DASHBOARDS']);
  });
});
