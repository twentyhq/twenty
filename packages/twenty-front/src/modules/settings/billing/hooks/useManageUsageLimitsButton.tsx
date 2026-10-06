import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { type ButtonProps, Button } from 'twenty-ui/primitives/input';
import { IconSettings } from 'twenty-ui/icon';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useManageUsageLimitsButton = ({
  color = 'danger',
}: { color?: ButtonProps['color'] } = {}): ReactNode => {
  const { t } = useLingui();

  const hasPermissionToManageUsageLimits = useHasPermissionFlag(
    PermissionFlagType.WORKSPACE,
  );

  const navigateSettings = useNavigateSettings();

  if (!hasPermissionToManageUsageLimits) {
    return undefined;
  }

  return (
    <Button
      size="sm"
      variant="outline"
      color={color}
      startIcon={<IconSettings />}
      onClick={() => navigateSettings(SettingsPath.BillingLimits)}
    >{t`Manage limits`}</Button>
  );
};
