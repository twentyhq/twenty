import { t } from '@lingui/core/macro';
import { Status } from 'twenty-ui/display';
import { UpgradeHealthEnum } from 'twenty-shared/types';

type SettingsAdminUpgradeStatusRightContainerProps = {
  instanceHealth: UpgradeHealthEnum | string;
  behindCount: number;
  failedCount: number;
};

export const SettingsAdminUpgradeStatusRightContainer = ({
  instanceHealth,
  behindCount,
  failedCount,
}: SettingsAdminUpgradeStatusRightContainerProps) => {
  const instanceOk = instanceHealth === UpgradeHealthEnum.upToDate;
  const workspacesOk = behindCount === 0 && failedCount === 0;

  if (instanceOk && workspacesOk) {
    return (
      <Status
        color="green"
        text={t`Instance and all workspaces are up to date`}
        weight="medium"
      />
    );
  }

  if (!instanceOk && !workspacesOk) {
    return (
      <Status
        color="red"
        text={t`Instance and Workspaces not up to date`}
        weight="medium"
      />
    );
  }

  if (!instanceOk) {
    return (
      <Status
        color={instanceHealth === UpgradeHealthEnum.failed ? 'red' : 'orange'}
        text={t`Instance not up to date`}
        weight="medium"
      />
    );
  }

  return (
    <Status
      color="orange"
      text={t`Workspaces behind or failed`}
      weight="medium"
    />
  );
};
