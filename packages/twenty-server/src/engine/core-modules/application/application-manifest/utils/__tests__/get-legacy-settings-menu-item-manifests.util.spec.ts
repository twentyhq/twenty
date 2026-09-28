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
  frontComponentUniversalIdentifiers = [FRONT_COMPONENT_UNIVERSAL_IDENTIFIER],
}: {
  settingsFrontComponentUniversalIdentifier?: string;
  settingsMenuItems?: unknown[];
  frontComponentUniversalIdentifiers?: string[];
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
    frontComponents: frontComponentUniversalIdentifiers.map(
      (universalIdentifier) => ({ universalIdentifier }),
    ),
    settingsMenuItems,
  }) as unknown as Manifest;

describe('getLegacySettingsMenuItemManifests', () => {
  it('should synthesize an item for the component the deprecated pointer names', () => {
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

  // The pre-install phase syncs manifest.application with its legacy pointer intact
  // but frontComponents emptied, so synthesizing there would fail the whole install
  // on a component that phase never registers.
  it('should synthesize nothing when the manifest carries no matching front component', () => {
    const legacySettingsMenuItems = getLegacySettingsMenuItemManifests(
      buildManifest({
        settingsFrontComponentUniversalIdentifier:
          FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
        frontComponentUniversalIdentifiers: [],
      }),
    );

    expect(legacySettingsMenuItems).toEqual([]);
  });

  it('should synthesize nothing when the manifest already declares an item', () => {
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
