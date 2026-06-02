import * as twentySdkDefine from '@/sdk/define';
import {
  TWENTY_SDK_DEFINE_STUBBED_EXPORTS,
  isDefineFactoryExportName,
} from '@/cli/utilities/build/common/plugins/stub-twenty-sdk-define.plugin';

describe('stub-twenty-sdk-define plugin', () => {
  const realExports = Object.keys(twentySdkDefine).sort();
  const stubbedExports = [
    ...TWENTY_SDK_DEFINE_STUBBED_EXPORTS.factories,
    ...TWENTY_SDK_DEFINE_STUBBED_EXPORTS.any,
  ].sort();

  it('classifies every twenty-sdk/define value-export', () => {
    expect(stubbedExports).toEqual(realExports);
  });

  it('classifies all defineX exports (and createValidationResult) as factories', () => {
    const expectedFactories = realExports
      .filter(isDefineFactoryExportName)
      .sort();

    expect([...TWENTY_SDK_DEFINE_STUBBED_EXPORTS.factories].sort()).toEqual(
      expectedFactories,
    );
  });

  it('every factory is callable in the real module (would-be misclassification guard)', () => {
    for (const name of TWENTY_SDK_DEFINE_STUBBED_EXPORTS.factories) {
      const actual = (twentySdkDefine as unknown as Record<string, unknown>)[
        name
      ];
      expect(typeof actual).toBe('function');
    }
  });

  // Snapshot to surface new exports in PR review. Update with
  // `npx vitest -u` when intentional.
  it('matches the recorded export partition', () => {
    expect(TWENTY_SDK_DEFINE_STUBBED_EXPORTS).toMatchSnapshot();
  });
});
