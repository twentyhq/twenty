import { Trans, useLingui } from '@lingui/react/macro';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { SettingsBillingPlansContent } from '@/settings/billing/components/SettingsBillingPlansContent';
import { SettingsBillingTabBar } from '@/settings/billing/components/SettingsBillingTabBar';
import { usePlans } from '@/settings/billing/hooks/usePlans';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Navigate } from 'react-router-dom';

export const SettingsBillingPlans = () => {
  const { t } = useLingui();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const billing = useAtomStateValue(billingState);
  const isBillingLoaded = isDefined(billing);
  const isBillingEnabled = billing?.isBillingEnabled === true;

  const { isPlansLoaded } = usePlans({ skip: !isBillingEnabled });

  if (isBillingLoaded && !isBillingEnabled) {
    return <Navigate to={getSettingsPath(SettingsPath.General)} replace />;
  }

  return (
    <SettingsPageLayout
      title={t`Billing`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: <Trans>Billing</Trans> },
      ]}
      secondaryBar={<SettingsBillingTabBar />}
    >
      {currentWorkspace && isBillingLoaded ? (
        <SettingsBillingPlansContent isPlansLoaded={isPlansLoaded} />
      ) : (
        <></>
      )}
    </SettingsPageLayout>
  );
};
