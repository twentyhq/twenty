import { t } from '@lingui/core/macro';
import { Status } from 'twenty-ui/display';

type SettingsAdminUpgradeStatusRightContainerProps = {
  behindCount: number;
  failedCount: number;
};

export const SettingsAdminUpgradeStatusRightContainer = ({
  behindCount,
  failedCount,
}: SettingsAdminUpgradeStatusRightContainerProps) => {
  if (behindCount > 0 || failedCount > 0) {
    return (
      <Status
        color="orange"
        text={t`Workspaces behind or failed`}
        weight="medium"
      />
    );
  }

  return <Status color="green" text={t`Healthy`} weight="medium" />;
};
