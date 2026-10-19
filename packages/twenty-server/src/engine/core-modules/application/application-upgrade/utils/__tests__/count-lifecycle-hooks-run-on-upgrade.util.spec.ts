import { type Manifest } from 'twenty-shared/application';

import { countLifecycleHooksRunOnUpgrade } from 'src/engine/core-modules/application/application-upgrade/utils/count-lifecycle-hooks-run-on-upgrade.util';

const buildManifest = (
  application: Partial<Manifest['application']>,
): Manifest => ({ application }) as Manifest;

describe('countLifecycleHooksRunOnUpgrade', () => {
  it('counts the hooks that run on a version upgrade', () => {
    expect(
      countLifecycleHooksRunOnUpgrade(
        buildManifest({
          preInstallLogicFunction: {
            universalIdentifier: 'pre',
            shouldRunOnVersionUpgrade: true,
          },
          postInstallLogicFunction: {
            universalIdentifier: 'post',
            shouldRunOnVersionUpgrade: true,
          },
        }),
      ),
    ).toBe(2);
  });

  it('skips the hooks that only run on a first install', () => {
    expect(
      countLifecycleHooksRunOnUpgrade(
        buildManifest({
          preInstallLogicFunction: { universalIdentifier: 'pre' },
          postInstallLogicFunction: {
            universalIdentifier: 'post',
            shouldRunOnVersionUpgrade: true,
          },
        }),
      ),
    ).toBe(1);
  });

  it('returns 0 without hooks or manifest', () => {
    expect(countLifecycleHooksRunOnUpgrade(buildManifest({}))).toBe(0);
    expect(countLifecycleHooksRunOnUpgrade(null)).toBe(0);
  });
});
