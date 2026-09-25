import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { IconSettings } from 'twenty-ui/icon';

import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useManageUsageLimitsButton = () => {
  const { t } = useLingui();

  const { [PermissionFlagType.BILLING]: hasPermissionToManageBilling } =
    usePermissionFlagMap();

  const navigateSettings = useNavigateSettings();

  if (!hasPermissionToManageBilling) {
    return undefined;
  }

  return {
    title: t`Manage limits`,
    Icon: IconSettings,
    onClick: () => navigateSettings(SettingsPath.BillingLimits),
  };
};
