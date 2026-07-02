import { Trans, useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { useSnackBarOnQueryError } from '@/apollo/hooks/useSnackBarOnQueryError';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { SettingsBillingTabBar } from '@/settings/billing/components/SettingsBillingTabBar';
import { usePlans } from '@/settings/billing/hooks/usePlans';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SettingsBillingPageLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { t } = useLingui();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const billing = useAtomStateValue(billingState);
  const isBillingLoaded = isDefined(billing);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;

  const {
    error: plansError,
    isPlansLoaded,
    loading: arePlansLoading,
  } = usePlans({ skip: !isBillingEnabled });

  useSnackBarOnQueryError(plansError, t`Failed to load billing plans`);

  if (isBillingLoaded && !isBillingEnabled) {
    return <Navigate to={getSettingsPath(SettingsPath.General)} replace />;
  }

  // Full-page skeleton like other settings pages, never inside the page body.
  // The isPlansLoaded guard keeps cached plans rendered while cache-and-network
  // refetches on tab switches
  if (
    !isDefined(currentWorkspace) ||
    !isBillingLoaded ||
    (isBillingEnabled && arePlansLoading && !isPlansLoaded)
  ) {
    return <SettingsSkeletonLoader />;
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
      {isPlansLoaded ? children : <></>}
    </SettingsPageLayout>
  );
};
