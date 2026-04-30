import { UpgradeHealthEnum } from 'twenty-shared/types';

export const getWorkspacesUpgradeHealth = (
  behindCount: number,
  failedCount: number,
): UpgradeHealthEnum => {
  if (failedCount > 0) {
    return UpgradeHealthEnum.FAILED;
  }

  if (behindCount > 0) {
    return UpgradeHealthEnum.BEHIND;
  }

  return UpgradeHealthEnum.UP_TO_DATE;
};
