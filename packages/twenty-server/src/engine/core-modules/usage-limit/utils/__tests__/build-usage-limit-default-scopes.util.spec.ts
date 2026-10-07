import { type NumericConfigVariableKey } from 'src/engine/core-modules/twenty-config/types/numeric-config-variable-key.type';
import { buildUsageLimitDefaultScopes } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-default-scopes.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

const CONFIG_VALUES: Partial<Record<NumericConfigVariableKey, number>> = {
  AI_CHAT_INCLUDED_WORKSPACE_DAILY_CREDIT_LIMIT: 5_000_000,
  AI_CHAT_INCLUDED_TRIAL_WORKSPACE_DAILY_CREDIT_LIMIT: 1_000_000,
};

const buildScopes = (isInTrialPeriod: boolean) =>
  buildUsageLimitDefaultScopes({
    getConfigValue: (key) => CONFIG_VALUES[key] ?? 0,
    isInTrialPeriod,
  });

const findIncludedChatScope = (isInTrialPeriod: boolean) =>
  buildScopes(isInTrialPeriod).find(
    (scope) => scope.operationType === UsageOperationType.AI_CHAT_INCLUDED,
  );

describe('buildUsageLimitDefaultScopes', () => {
  it('gives a trialing workspace the trial value of a default, flagged as such', () => {
    expect(findIncludedChatScope(true)).toEqual(
      expect.objectContaining({
        limitValue: 1_000_000,
        isTrialLimitValue: true,
      }),
    );
  });

  it('gives a workspace past its trial the regular value', () => {
    expect(findIncludedChatScope(false)).toEqual(
      expect.objectContaining({
        limitValue: 5_000_000,
        isTrialLimitValue: false,
      }),
    );
  });

  it('never flags a default that has no trial value', () => {
    expect(
      buildScopes(true)
        .filter(
          (scope) =>
            scope.operationType !== UsageOperationType.AI_CHAT_INCLUDED,
        )
        .some((scope) => scope.isTrialLimitValue),
    ).toBe(false);
  });
});
