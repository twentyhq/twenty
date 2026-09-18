import { RICH_APP_PATH } from '@/cli/__tests__/apps/fixture-paths';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';

const BILLING_SETTINGS_UNIVERSAL_IDENTIFIER =
  'f2a4c8d0-1b3e-4f5a-9c7d-2e8b6a0f4c11';
const SYNC_SETTINGS_UNIVERSAL_IDENTIFIER =
  'a1b3d7e9-0c2f-4e6b-8d5a-1f7c9b3e5a22';

describe('buildManifest settings front components', () => {
  it('accepts several settings front components and keeps each tab', async () => {
    const { manifest, errors } = await buildManifest(RICH_APP_PATH);

    expect(errors).toEqual([]);

    const settingsFrontComponents = manifest?.frontComponents.filter(
      ({ settingsTab }) => settingsTab !== undefined,
    );

    expect(
      settingsFrontComponents?.map(({ universalIdentifier, settingsTab }) => ({
        universalIdentifier,
        settingsTab,
      })),
    ).toEqual(
      expect.arrayContaining([
        {
          universalIdentifier: SYNC_SETTINGS_UNIVERSAL_IDENTIFIER,
          settingsTab: { label: 'Sync', icon: 'IconRefresh', position: 1 },
        },
        {
          universalIdentifier: BILLING_SETTINGS_UNIVERSAL_IDENTIFIER,
          settingsTab: {
            label: 'Billing',
            icon: 'IconCreditCard',
            position: 2,
          },
        },
      ]),
    );
    expect(settingsFrontComponents).toHaveLength(2);
  }, 60000);

  it('leaves settingsTab undefined on regular front components, even one declaring it', async () => {
    const { manifest, errors } = await buildManifest(RICH_APP_PATH);

    expect(errors).toEqual([]);

    // The fixture smuggles a settingsTab past the config type on purpose
    const regularFrontComponent = manifest?.frontComponents.find(
      ({ name }) => name === 'card-component',
    );

    expect(regularFrontComponent).toBeDefined();
    expect(regularFrontComponent?.settingsTab).toBeUndefined();
  }, 60000);

  it('no longer advertises a single settings front component on the application', async () => {
    const { manifest, errors } = await buildManifest(RICH_APP_PATH);

    expect(errors).toEqual([]);
    expect(manifest?.application.settingsFrontComponent).toBeUndefined();
  }, 60000);
});
