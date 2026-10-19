import { type Manifest } from 'twenty-shared/application';

import { countPrebuiltBundleInstalls } from 'src/engine/core-modules/application/application-install/utils/count-prebuilt-bundle-installs.util';

const buildManifest = ({
  application,
  logicFunctionCount,
}: {
  application: Partial<Manifest['application']>;
  logicFunctionCount: number;
}): Manifest =>
  ({
    application,
    logicFunctions: Array.from({ length: logicFunctionCount }, () => ({})),
  }) as Manifest;

const MANIFEST_WITH_HOOKS = buildManifest({
  application: {
    preInstallLogicFunction: { universalIdentifier: 'pre' },
    postInstallLogicFunction: {
      universalIdentifier: 'post',
      shouldRunOnVersionUpgrade: true,
    },
  },
  logicFunctionCount: 4,
});

describe('countPrebuiltBundleInstalls', () => {
  it('counts every hook and function on a first install', () => {
    expect(
      countPrebuiltBundleInstalls({
        manifest: MANIFEST_WITH_HOOKS,
        isVersionUpgrade: false,
      }),
    ).toBe(6);
  });

  it('only counts the hooks that run on a version upgrade', () => {
    expect(
      countPrebuiltBundleInstalls({
        manifest: MANIFEST_WITH_HOOKS,
        isVersionUpgrade: true,
      }),
    ).toBe(5);
  });

  it('returns 0 without a manifest', () => {
    expect(
      countPrebuiltBundleInstalls({ manifest: null, isVersionUpgrade: false }),
    ).toBe(0);
  });
});
