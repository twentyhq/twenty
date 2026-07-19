import { shouldTolerateUpgradeWorkspaceFailures } from 'src/database/commands/upgrade-version-command/utils/should-tolerate-upgrade-workspace-failures.util';

describe('shouldTolerateUpgradeWorkspaceFailures', () => {
  it('should fail closed on a single-workspace instance without override', () => {
    expect(
      shouldTolerateUpgradeWorkspaceFailures({
        isMultiWorkspaceEnabled: false,
        continueOnError: false,
      }),
    ).toBe(false);
  });

  it('should tolerate workspace failures when multi-workspace is enabled', () => {
    expect(
      shouldTolerateUpgradeWorkspaceFailures({
        isMultiWorkspaceEnabled: true,
        continueOnError: false,
      }),
    ).toBe(true);
  });

  it('should tolerate workspace failures when UPGRADE_CONTINUE_ON_ERROR is set', () => {
    expect(
      shouldTolerateUpgradeWorkspaceFailures({
        isMultiWorkspaceEnabled: false,
        continueOnError: true,
      }),
    ).toBe(true);
  });

  it('should tolerate when both multi-workspace and continue-on-error are set', () => {
    expect(
      shouldTolerateUpgradeWorkspaceFailures({
        isMultiWorkspaceEnabled: true,
        continueOnError: true,
      }),
    ).toBe(true);
  });
});
