import {
  getLegacySettingPageUniversalIdentifier,
  type Manifest,
} from 'twenty-shared/application';

import { getLegacySettingPageManifests } from 'src/engine/core-modules/application/application-manifest/utils/get-legacy-setting-page-manifests.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = '39783023-bcac-41e3-b0d2-ff1944d8465d';
const FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '88c15ae2-5f87-4a6b-b48f-1974bbe62eb7';

const buildManifest = ({
  settingsFrontComponentUniversalIdentifier,
  settingPages = [],
}: {
  settingsFrontComponentUniversalIdentifier?: string;
  settingPages?: unknown[];
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
    settingPages,
  }) as unknown as Manifest;

describe('getLegacySettingPageManifests', () => {
  it('should synthesize a page for the component the deprecated pointer names', () => {
    const legacySettingPages = getLegacySettingPageManifests(
      buildManifest({
        settingsFrontComponentUniversalIdentifier:
          FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      }),
    );

    expect(legacySettingPages).toEqual([
      {
        universalIdentifier: getLegacySettingPageUniversalIdentifier({
          applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          frontComponentUniversalIdentifier:
            FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
        }),
        frontComponentUniversalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
        title: 'Variables',
        icon: 'IconVariable',
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

    expect(getLegacySettingPageManifests(manifest)[0].universalIdentifier).toBe(
      getLegacySettingPageManifests(manifest)[0].universalIdentifier,
    );
  });

  it('should synthesize nothing when the manifest already declares a page', () => {
    expect(
      getLegacySettingPageManifests(
        buildManifest({
          settingsFrontComponentUniversalIdentifier:
            FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          settingPages: [{ universalIdentifier: 'declared' }],
        }),
      ),
    ).toEqual([]);
  });

  it('should synthesize nothing without the deprecated pointer', () => {
    expect(getLegacySettingPageManifests(buildManifest({}))).toEqual([]);
  });
});
