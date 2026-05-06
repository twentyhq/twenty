import { type UpgradeStatusRow } from '@/settings/admin-panel/health-status/components/SettingsAdminUpgradeStatusListCard';
import { getUpgradeHealthStatusBadge } from '@/settings/admin-panel/utils/getUpgradeHealthStatusBadge';
import { getWorkspacesUpgradeHealth } from '@/settings/admin-panel/utils/getWorkspacesUpgradeHealth';
import { getWorkspacesUpgradeHealthText } from '@/settings/admin-panel/utils/getWorkspacesUpgradeHealthText';
import { t } from '@lingui/core/macro';
import { Status } from 'twenty-ui/display';

export const SettingsAdminUpgradeStatusRightContainer = ({
  item,
}: {
  item: UpgradeStatusRow;
}) => {
  if (item.kind === 'inferred-version') {
    return (
      <Status
        color="gray"
        text={item.inferredVersion ?? t`Unknown`}
        weight="medium"
      />
    );
  }

  if (item.kind === 'instance-status') {
    const badge = getUpgradeHealthStatusBadge(item.instanceHealth);

    return <Status color={badge.color} text={badge.label} weight="medium" />;
  }

  const workspacesUpgradeHealth = getWorkspacesUpgradeHealth(
    item.behindCount,
    item.failedCount,
  );
  const workspacesUpgradeHealthBadge = getUpgradeHealthStatusBadge(
    workspacesUpgradeHealth,
  );
  const workspacesUpgradeHealthText = getWorkspacesUpgradeHealthText(
    item.behindCount,
    item.failedCount,
    workspacesUpgradeHealthBadge.label,
  );

  return (
    <Status
      color={workspacesUpgradeHealthBadge.color}
      text={workspacesUpgradeHealthText}
      weight="medium"
    />
  );
};
