import { UsageLimitExceptionCode } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { assertUsageLimitInstanceOverrideIsAllowed } from 'src/engine/core-modules/usage-limit/utils/assert-usage-limit-instance-override-is-allowed.util';

describe('assertUsageLimitInstanceOverrideIsAllowed', () => {
  it('refuses a workspace write on a row an operator set', () => {
    expect(() =>
      assertUsageLimitInstanceOverrideIsAllowed({
        usageLimit: { isInstanceOverride: true },
        isOperator: false,
      }),
    ).toThrow(
      expect.objectContaining({
        code: UsageLimitExceptionCode.LIMIT_FORBIDDEN,
      }),
    );
  });

  it('lets an operator change the row it set', () => {
    expect(() =>
      assertUsageLimitInstanceOverrideIsAllowed({
        usageLimit: { isInstanceOverride: true },
        isOperator: true,
      }),
    ).not.toThrow();
  });

  it('leaves a row the workspace set for itself alone', () => {
    expect(() =>
      assertUsageLimitInstanceOverrideIsAllowed({
        usageLimit: { isInstanceOverride: false },
        isOperator: false,
      }),
    ).not.toThrow();
  });
});
