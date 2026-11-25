import { type UpgradeStatusRow } from '@/settings/admin-panel/health-status/components/SettingsAdminUpgradeStatusListCard';
import { getUpgradeHealthStatusBadge } from '@/settings/admin-panel/utils/getUpgradeHealthStatusBadge';
import { getWorkspacesUpgradeHealth } from '@/settings/admin-panel/utils/getWorkspacesUpgradeHealth';
import { getWorkspacesUpgradeHealthText } from '@/settings/admin-panel/utils/getWorkspacesUpgradeHealthText';
import { Status } from 'twenty-ui/primitives/data-display';
import { useLingui } from '@lingui/react/macro';

export const SettingsAdminUpgradeStatusRightContainer = ({
  item,
}: {
  item: UpgradeStatusRow;
}) => {
  const { t } = useLingui();
  if (item.kind === 'inferred-version') {
    return (
      <Status color="gray" weight="medium">
        {item.inferredVersion ?? t`Unknown`}
      </Status>
    );
  }

  if (item.kind === 'instance-status') {
    const badge = getUpgradeHealthStatusBadge(item.instanceHealth);

    return (
      <Status color={badge.color} weight="medium">
        {badge.label}
      </Status>
    );
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
    <Status color={workspacesUpgradeHealthBadge.color} weight="medium">
      {workspacesUpgradeHealthText}
    </Status>
  );
};
