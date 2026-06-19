import { t } from '@lingui/core/macro';
import { type ThemeColor } from 'twenty-ui/theme';
import { UpgradeHealth } from '~/generated-admin/graphql';

type UpgradeHealthStatusBadge = {
  color: ThemeColor;
  label: string;
};

export const getUpgradeHealthStatusBadge = (
  health: UpgradeHealth | undefined,
): UpgradeHealthStatusBadge => {
  switch (health) {
    case UpgradeHealth.UP_TO_DATE:
      return { color: 'green', label: t`Up to date` };
    case UpgradeHealth.BEHIND:
      return { color: 'orange', label: t`Behind` };
    case UpgradeHealth.FAILED:
      return { color: 'red', label: t`Failed` };
    default:
      return { color: 'gray', label: t`Unknown` };
  }
};
