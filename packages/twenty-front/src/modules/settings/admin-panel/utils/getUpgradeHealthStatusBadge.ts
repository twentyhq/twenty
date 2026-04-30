import { t } from '@lingui/core/macro';
import { UpgradeHealthEnum } from 'twenty-shared/types';
import { type ThemeColor } from 'twenty-ui/theme';

type UpgradeHealthStatusBadge = {
  color: ThemeColor;
  label: string;
};

export const getUpgradeHealthStatusBadge = (
  health: UpgradeHealthEnum | undefined,
): UpgradeHealthStatusBadge => {
  switch (health) {
    case UpgradeHealthEnum.UP_TO_DATE:
      return { color: 'green', label: t`Up to date` };
    case UpgradeHealthEnum.BEHIND:
      return { color: 'orange', label: t`Behind` };
    case UpgradeHealthEnum.FAILED:
      return { color: 'red', label: t`Failed` };
    default:
      return { color: 'gray', label: t`Unknown` };
  }
};
