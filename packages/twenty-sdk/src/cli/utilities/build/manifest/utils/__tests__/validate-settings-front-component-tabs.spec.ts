import { type FrontComponentManifest } from 'twenty-shared/application';

import { validateSettingsFrontComponentTabs } from '@/cli/utilities/build/manifest/utils/validate-settings-front-component-tabs';

const buildFrontComponent = (
  frontComponent: Partial<FrontComponentManifest> &
    Pick<FrontComponentManifest, 'universalIdentifier'>,
): FrontComponentManifest =>
  ({
    name: 'a-component',
    componentName: 'AComponent',
    sourceComponentPath: 'src/front-components/a-component.tsx',
    builtComponentPath: 'src/front-components/a-component.mjs',
    builtComponentChecksum: '',
    isHeadless: false,
    ...frontComponent,
  }) as FrontComponentManifest;

describe('validateSettingsFrontComponentTabs', () => {
  it('should accept a single settings front component without a tab', () => {
    const errors = validateSettingsFrontComponentTabs({
      frontComponents: [
        buildFrontComponent({ universalIdentifier: 'a', settingsTab: {} }),
        buildFrontComponent({ universalIdentifier: 'b' }),
      ],
    });

    expect(errors).toEqual([]);
  });

  it('should accept several settings front components that all declare a tab', () => {
    const errors = validateSettingsFrontComponentTabs({
      frontComponents: [
        buildFrontComponent({
          universalIdentifier: 'a',
          settingsTab: { label: 'Sync' },
        }),
        buildFrontComponent({
          universalIdentifier: 'b',
          settingsTab: { position: 2 },
        }),
      ],
    });

    expect(errors).toEqual([]);
  });

  it('should reject a settings front component left without a tab alongside a sibling', () => {
    const errors = validateSettingsFrontComponentTabs({
      frontComponents: [
        buildFrontComponent({
          universalIdentifier: 'a',
          name: 'sync-settings',
          settingsTab: {},
        }),
        buildFrontComponent({
          universalIdentifier: 'b',
          settingsTab: { label: 'Billing' },
        }),
      ],
    });

    expect(errors).toEqual([
      'Settings front component "sync-settings" must declare a tab when the application declares several settings front components',
    ]);
  });

  it('should report every settings front component left without a tab', () => {
    const errors = validateSettingsFrontComponentTabs({
      frontComponents: [
        buildFrontComponent({
          universalIdentifier: 'a',
          name: 'sync-settings',
          settingsTab: {},
        }),
        buildFrontComponent({
          universalIdentifier: 'b',
          name: 'billing-settings',
          settingsTab: {},
        }),
      ],
    });

    expect(errors).toHaveLength(2);
  });

  it('should fall back to the source path when the component has no name', () => {
    const errors = validateSettingsFrontComponentTabs({
      frontComponents: [
        buildFrontComponent({
          universalIdentifier: 'a',
          name: undefined,
          sourceComponentPath: 'src/front-components/unnamed.tsx',
          settingsTab: {},
        }),
        buildFrontComponent({
          universalIdentifier: 'b',
          settingsTab: { label: 'Billing' },
        }),
      ],
    });

    expect(errors).toEqual([
      'Settings front component "src/front-components/unnamed.tsx" must declare a tab when the application declares several settings front components',
    ]);
  });
});
