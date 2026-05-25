import { plural } from '@lingui/core/macro';

export const getWorkspacesUpgradeHealthText = (
  behindCount: number,
  failedCount: number,
  upToDateLabel: string,
): string => {
  if (failedCount > 0 && behindCount > 0) {
    return plural(failedCount + behindCount, {
      one: '# workspace failed or behind',
      other: '# workspaces failed or behind',
    });
  }

  if (failedCount > 0) {
    return plural(failedCount, {
      one: '# workspace failed',
      other: '# workspaces failed',
    });
  }

  if (behindCount > 0) {
    return plural(behindCount, {
      one: '# workspace behind',
      other: '# workspaces behind',
    });
  }

  return upToDateLabel;
};
