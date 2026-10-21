import { formatWorkspaceUpgradeStatusLabel } from 'src/engine/core-modules/upgrade/utils/format-workspace-upgrade-status-label.util';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

describe('formatWorkspaceUpgradeStatusLabel', () => {
  it('should keep the first three characters of the display name and the first section of the workspace id when anonymized', () => {
    expect(
      formatWorkspaceUpgradeStatusLabel({
        workspaceId: WORKSPACE_ID,
        displayName: 'Apple',
        anonymize: true,
      }),
    ).toBe('App*** (20202020-***)');
  });

  it('should only display the anonymized workspace id when there is no display name', () => {
    expect(
      formatWorkspaceUpgradeStatusLabel({
        workspaceId: WORKSPACE_ID,
        displayName: null,
        anonymize: true,
      }),
    ).toBe('20202020-***');
  });

  it('should mask display names shorter than the visible length', () => {
    expect(
      formatWorkspaceUpgradeStatusLabel({
        workspaceId: WORKSPACE_ID,
        displayName: 'Ab',
        anonymize: true,
      }),
    ).toBe('Ab*** (20202020-***)');
  });

  it('should not split multi code unit characters when anonymized', () => {
    expect(
      formatWorkspaceUpgradeStatusLabel({
        workspaceId: WORKSPACE_ID,
        displayName: '🚀🚀🚀🚀 Rockets',
        anonymize: true,
      }),
    ).toBe('🚀🚀🚀*** (20202020-***)');
  });

  it('should display the full display name and workspace id when not anonymized', () => {
    expect(
      formatWorkspaceUpgradeStatusLabel({
        workspaceId: WORKSPACE_ID,
        displayName: 'Apple',
        anonymize: false,
      }),
    ).toBe(`Apple (${WORKSPACE_ID})`);
  });

  it('should only display the full workspace id when there is no display name and not anonymized', () => {
    expect(
      formatWorkspaceUpgradeStatusLabel({
        workspaceId: WORKSPACE_ID,
        displayName: '',
        anonymize: false,
      }),
    ).toBe(WORKSPACE_ID);
  });
});
