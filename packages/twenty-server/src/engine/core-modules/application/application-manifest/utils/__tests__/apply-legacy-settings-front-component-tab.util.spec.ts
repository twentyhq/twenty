import {
  DEFAULT_FRONT_COMPONENT_SETTINGS_TAB,
  type Manifest,
} from 'twenty-shared/application';

import { applyLegacySettingsFrontComponentTab } from 'src/engine/core-modules/application/application-manifest/utils/apply-legacy-settings-front-component-tab.util';

const SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'settings-front-component-universal-identifier';
const OTHER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'other-front-component-universal-identifier';

const buildManifest = ({
  settingsFrontComponentUniversalIdentifier,
  frontComponents,
}: {
  settingsFrontComponentUniversalIdentifier?: string;
  frontComponents: { universalIdentifier: string; settingsTab?: object }[];
}) =>
  ({
    application: {
      displayName: 'Stripe',
      ...(settingsFrontComponentUniversalIdentifier !== undefined
        ? {
            settingsFrontComponent: {
              universalIdentifier: settingsFrontComponentUniversalIdentifier,
            },
          }
        : {}),
    },
    frontComponents,
  }) as unknown as Manifest;

describe('applyLegacySettingsFrontComponentTab', () => {
  it('should give the default tab to the component the legacy pointer names', () => {
    const manifest = applyLegacySettingsFrontComponentTab(
      buildManifest({
        settingsFrontComponentUniversalIdentifier:
          SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
        frontComponents: [
          {
            universalIdentifier: OTHER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
          {
            universalIdentifier: SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        ],
      }),
    );

    expect(
      manifest.frontComponents.map(({ universalIdentifier, settingsTab }) => ({
        universalIdentifier,
        settingsTab,
      })),
    ).toEqual([
      {
        universalIdentifier: OTHER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
        settingsTab: undefined,
      },
      {
        universalIdentifier: SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
        settingsTab: DEFAULT_FRONT_COMPONENT_SETTINGS_TAB,
      },
    ]);
  });

  it('should leave a manifest that already declares a tab untouched', () => {
    const rawManifest = buildManifest({
      settingsFrontComponentUniversalIdentifier:
        SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      frontComponents: [
        {
          universalIdentifier: OTHER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          settingsTab: { label: 'Sync' },
        },
        {
          universalIdentifier: SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
        },
      ],
    });

    expect(applyLegacySettingsFrontComponentTab(rawManifest)).toBe(rawManifest);
  });

  it('should leave a manifest without the legacy pointer untouched', () => {
    const rawManifest = buildManifest({
      frontComponents: [
        { universalIdentifier: OTHER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER },
      ],
    });

    expect(applyLegacySettingsFrontComponentTab(rawManifest)).toBe(rawManifest);
  });

  it('should not mutate the given manifest', () => {
    const rawManifest = buildManifest({
      settingsFrontComponentUniversalIdentifier:
        SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      frontComponents: [
        { universalIdentifier: SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER },
      ],
    });

    applyLegacySettingsFrontComponentTab(rawManifest);

    expect(rawManifest.frontComponents[0].settingsTab).toBeUndefined();
  });

  it('should leave the components alone when the legacy pointer names none of them', () => {
    const manifest = applyLegacySettingsFrontComponentTab(
      buildManifest({
        settingsFrontComponentUniversalIdentifier:
          SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
        frontComponents: [
          { universalIdentifier: OTHER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER },
        ],
      }),
    );

    expect(manifest.frontComponents[0].settingsTab).toBeUndefined();
  });
});
