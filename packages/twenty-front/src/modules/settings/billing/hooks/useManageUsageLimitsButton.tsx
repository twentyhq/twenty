import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { IconSettings } from 'twenty-ui/icon';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useManageUsageLimitsButton = (): ReactNode => {
  const { t } = useLingui();

  const hasPermissionToManageUsageLimits = useHasPermissionFlag(
    PermissionFlagType.WORKSPACE,
  );

  const navigateSettings = useNavigateSettings();

  if (!hasPermissionToManageUsageLimits) {
    return undefined;
  }

  return (
    <InlineBanner.Action
      startIcon={<IconSettings />}
      onClick={() => navigateSettings(SettingsPath.BillingLimits)}
    >{t`Manage limits`}</InlineBanner.Action>
  );
};
