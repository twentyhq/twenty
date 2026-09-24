import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconArrowUp, IconLock, IconTerminal } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { currentUserState } from '@/auth/states/currentUserState';
import { billingState } from '@/client-config/states/billingState';
import { SettingsLogsPlaceholder } from '@/settings/log-explorer/components/SettingsLogsPlaceholder';
import { type SettingsLogsSourceId } from '@/settings/log-explorer/types/SettingsLogsSourceId';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsLogsLockedPlaceholder = () => {
  const { t } = useLingui();
  const location = useLocation();
  const currentUser = useAtomStateValue(currentUserState);
  const billing = useAtomStateValue(billingState);

  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const canAccessAdminPanel = currentUser?.canAccessFullAdminPanel === true;
  const canDisplayUpgradeButton = isBillingEnabled || canAccessAdminPanel;
  const upgradeSettingsPath = isBillingEnabled
    ? SettingsPath.BillingPlans
    : SettingsPath.AdminPanelOrganization;

  return (
    <SettingsLogsPlaceholder
      Icon={IconLock}
      title={t`Audit logs are part of the Organization plan`}
      description={t`Record changes, security events, webhook deliveries, page views and usage need the Organization plan. App logs are available on every plan.`}
      actions={
        <StyledActions>
          {canDisplayUpgradeButton && (
            <NavigationButton
              variant="solid"
              color="accent"
              startIcon={<IconArrowUp />}
              to={getSettingsPath(upgradeSettingsPath)}
            >
              {t`Upgrade`}
            </NavigationButton>
          )}
          <NavigationButton
            startIcon={<IconTerminal />}
            to={{
              search: location.search,
              hash: 'app-logs' satisfies SettingsLogsSourceId,
            }}
          >
            {t`Open app logs`}
          </NavigationButton>
        </StyledActions>
      }
    />
  );
};
