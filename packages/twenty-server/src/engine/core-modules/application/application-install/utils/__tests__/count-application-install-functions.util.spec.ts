import { countApplicationInstallFunctions } from 'src/engine/core-modules/application/application-install/utils/count-application-install-functions.util';

const MANIFEST_WITH_HOOKS = {
  application: {
    preInstallLogicFunction: { universalIdentifier: 'pre' },
    postInstallLogicFunction: {
      universalIdentifier: 'post',
      shouldRunOnVersionUpgrade: true,
    },
  },
  logicFunctions: [{}, {}, {}, {}],
};

describe('countApplicationInstallFunctions', () => {
  it('counts every hook and function on a first install', () => {
    expect(
      countApplicationInstallFunctions({
        manifest: MANIFEST_WITH_HOOKS,
        isVersionUpgrade: false,
      }),
    ).toBe(6);
  });

  it('only counts the hooks that run on a version upgrade', () => {
    expect(
      countApplicationInstallFunctions({
        manifest: MANIFEST_WITH_HOOKS,
        isVersionUpgrade: true,
      }),
    ).toBe(5);
  });

  it('returns 0 without a manifest', () => {
    expect(
      countApplicationInstallFunctions({
        manifest: null,
        isVersionUpgrade: false,
      }),
    ).toBe(0);
  });
});
