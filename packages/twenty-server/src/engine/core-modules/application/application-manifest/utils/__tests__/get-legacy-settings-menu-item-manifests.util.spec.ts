import {
  getLegacySettingsMenuItemUniversalIdentifier,
  type Manifest,
} from 'twenty-shared/application';

import { getLegacySettingsMenuItemManifests } from 'src/engine/core-modules/application/application-manifest/utils/get-legacy-settings-menu-item-manifests.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = '39783023-bcac-41e3-b0d2-ff1944d8465d';
const FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '88c15ae2-5f87-4a6b-b48f-1974bbe62eb7';

const buildManifest = ({
  settingsFrontComponentUniversalIdentifier,
  settingsMenuItems = [],
}: {
  settingsFrontComponentUniversalIdentifier?: string;
  settingsMenuItems?: unknown[];
}) =>
  ({
    application: {
      universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      displayName: 'Stripe',
      ...(settingsFrontComponentUniversalIdentifier === undefined
        ? {}
        : {
            settingsFrontComponent: {
              universalIdentifier: settingsFrontComponentUniversalIdentifier,
            },
          }),
    },
    settingsMenuItems,
  }) as unknown as Manifest;

describe('getLegacySettingsMenuItemManifests', () => {
  it('should synthesize a page for the component the deprecated pointer names', () => {
    const legacySettingsMenuItems = getLegacySettingsMenuItemManifests(
      buildManifest({
        settingsFrontComponentUniversalIdentifier:
          FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      }),
    );

    expect(legacySettingsMenuItems).toEqual([
      {
        universalIdentifier: getLegacySettingsMenuItemUniversalIdentifier({
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          frontComponentUniversalIdentifier:
            FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
        }),
        frontComponentUniversalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
        title: 'Settings',
        icon: 'IconAdjustments',
      },
    ]);
  });

  // The identifier has to match what the upgrade backfill wrote, otherwise the
  // sync deletes the backfilled row and creates a second one.
  it('should derive an identifier that is stable across calls', () => {
    const manifest = buildManifest({
      settingsFrontComponentUniversalIdentifier:
        FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
    });

    expect(
      getLegacySettingsMenuItemManifests(manifest)[0].universalIdentifier,
    ).toBe(getLegacySettingsMenuItemManifests(manifest)[0].universalIdentifier);
  });

  it('should synthesize nothing when the manifest already declares a page', () => {
    expect(
      getLegacySettingsMenuItemManifests(
        buildManifest({
          settingsFrontComponentUniversalIdentifier:
            FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          settingsMenuItems: [{ universalIdentifier: 'declared' }],
        }),
      ),
    ).toEqual([]);
  });

  it('should synthesize nothing without the deprecated pointer', () => {
    expect(getLegacySettingsMenuItemManifests(buildManifest({}))).toEqual([]);
  });
});
