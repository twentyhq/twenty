import { isLogicFunctionWarmEligible } from 'src/engine/core-modules/logic-function/logic-function-warm-up/utils/is-logic-function-warm-eligible.util';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

const READY_PREBUILT_FIELDS = {
  executionMode: LogicFunctionExecutionMode.PREBUILT,
  isBuildUpToDate: true,
  checksum: 'checksum',
};

describe('isLogicFunctionWarmEligible', () => {
  it('accepts a warm function with an installable prebuilt bundle', () => {
    expect(
      isLogicFunctionWarmEligible({ ...READY_PREBUILT_FIELDS, keepWarm: true }),
    ).toBe(true);
  });

  it('rejects a function that is not warm', () => {
    expect(
      isLogicFunctionWarmEligible({ ...READY_PREBUILT_FIELDS, keepWarm: false }),
    ).toBe(false);
  });

  it('rejects a warm LIVE function', () => {
    expect(
      isLogicFunctionWarmEligible({
        ...READY_PREBUILT_FIELDS,
        executionMode: LogicFunctionExecutionMode.LIVE,
        keepWarm: true,
      }),
    ).toBe(false);
  });

  it('rejects a warm function whose prebuilt bundle is not ready', () => {
    expect(
      isLogicFunctionWarmEligible({
        ...READY_PREBUILT_FIELDS,
        checksum: null,
        keepWarm: true,
      }),
    ).toBe(false);
  });
});
