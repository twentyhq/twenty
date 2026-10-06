import { useLingui } from '@lingui/react/macro';
import { type ComponentProps } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { type InlineBanner } from 'twenty-ui/components';
import { IconSettings } from 'twenty-ui/icon';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useManageUsageLimitsButton = (): ComponentProps<
  typeof InlineBanner
>['button'] => {
  const { t } = useLingui();

  const hasPermissionToManageUsageLimits = useHasPermissionFlag(
    PermissionFlagType.WORKSPACE,
  );

  const navigateSettings = useNavigateSettings();

  if (!hasPermissionToManageUsageLimits) {
    return undefined;
  }

  return {
    title: t`Manage limits`,
    Icon: IconSettings,
    onClick: () => navigateSettings(SettingsPath.BillingLimits),
  };
};
