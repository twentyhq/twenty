import { getUpgradeHealthStatusBadge } from '@/settings/admin-panel/utils/getUpgradeHealthStatusBadge';
import { getWorkspacesUpgradeHealth } from '@/settings/admin-panel/utils/getWorkspacesUpgradeHealth';
import { getWorkspacesUpgradeHealthText } from '@/settings/admin-panel/utils/getWorkspacesUpgradeHealthText';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import {
  IconAlertTriangle,
  IconClock,
  IconStatusChange,
  IconX,
  Status,
} from 'twenty-ui/display';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

type SettingsAdminWorkspacesStatusSummaryCardProps = {
  behindCount: number;
  failedCount: number;
  computedAt: string | undefined;
};

export const SettingsAdminWorkspacesStatusSummaryCard = ({
  behindCount,
  failedCount,
  computedAt,
}: SettingsAdminWorkspacesStatusSummaryCardProps) => {
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const workspacesUpgradeHealth = getWorkspacesUpgradeHealth(
    behindCount,
    failedCount,
  );
  const workspacesUpgradeHealthBadge = getUpgradeHealthStatusBadge(
    workspacesUpgradeHealth,
  );
  const workspacesUpgradeHealthText = getWorkspacesUpgradeHealthText(
    behindCount,
    failedCount,
    workspacesUpgradeHealthBadge.label,
  );

  return (
    <SettingsTableCard
      items={[
        {
          Icon: IconStatusChange,
          label: t`Upgrade health`,
          value: (
            <Status
              color={workspacesUpgradeHealthBadge.color}
              text={workspacesUpgradeHealthText}
              weight="medium"
            />
          ),
        },
        {
          Icon: IconAlertTriangle,
          label: t`Behind`,
          value: behindCount,
        },
        {
          Icon: IconX,
          label: t`Failed`,
          value: failedCount,
        },
        {
          Icon: IconClock,
          label: t`Computed at`,
          value:
            formatDateTimeString({
              value: computedAt,
              timeZone,
              dateFormat,
              timeFormat,
              localeCatalog,
            }) || t`N/A`,
        },
      ]}
      gridAutoColumns="3fr 4fr"
    />
  );
};
