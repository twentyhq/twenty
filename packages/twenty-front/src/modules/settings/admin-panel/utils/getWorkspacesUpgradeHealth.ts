import { UpgradeHealth } from '~/generated-admin/graphql';

export const getWorkspacesUpgradeHealth = (
  behindCount: number,
  failedCount: number,
): UpgradeHealth => {
  if (failedCount > 0) {
    return UpgradeHealth.FAILED;
  }

  if (behindCount > 0) {
    return UpgradeHealth.BEHIND;
  }

  return UpgradeHealth.UP_TO_DATE;
};
