import { resolveRunsWithUserAuthority } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/resolve-runs-with-user-authority.util';

describe('resolveRunsWithUserAuthority', () => {
  it('should honour an explicit declaration over the trigger', () => {
    expect(
      resolveRunsWithUserAuthority({
        runsWithUserAuthority: false,
        httpRouteTriggerSettings: { isAuthRequired: true },
      }),
    ).toBe(false);

    expect(
      resolveRunsWithUserAuthority({
        runsWithUserAuthority: true,
        httpRouteTriggerSettings: null,
      }),
    ).toBe(true);
  });

  it('should keep an undeclared authenticated route acting as its caller', () => {
    expect(
      resolveRunsWithUserAuthority({
        runsWithUserAuthority: null,
        httpRouteTriggerSettings: { isAuthRequired: true },
      }),
    ).toBe(true);
  });

  it('should keep every other undeclared function acting as the application', () => {
    expect(
      resolveRunsWithUserAuthority({
        runsWithUserAuthority: null,
        httpRouteTriggerSettings: { isAuthRequired: false },
      }),
    ).toBe(false);

    expect(
      resolveRunsWithUserAuthority({
        runsWithUserAuthority: null,
        httpRouteTriggerSettings: null,
      }),
    ).toBe(false);
  });
});
