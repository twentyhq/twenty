import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { Trans, useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { SettingsBillingContentSkeleton } from '@/settings/billing/components/SettingsBillingContentSkeleton';
import { SettingsBillingPlansErrorState } from '@/settings/billing/components/SettingsBillingPlansErrorState';
import { SettingsBillingTabBar } from '@/settings/billing/components/SettingsBillingTabBar';
import { usePlans } from '@/settings/billing/hooks/usePlans';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SettingsBillingPageLayout = ({
  children,
  actionButton,
}: {
  children: ReactNode;
  actionButton?: ReactNode;
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
    refetch: refetchPlans,
  } = usePlans({ skip: !isBillingEnabled });

  if (isBillingLoaded && !isBillingEnabled) {
    return (
      <>
        <ToastOnQueryErrorEffect
          error={plansError}
          message={t`Failed to load billing plans`}
        />
        <Navigate to={getSettingsPath(SettingsPath.General)} replace />
      </>
    );
  }

  return (
    <>
      <ToastOnQueryErrorEffect
        error={plansError}
        message={t`Failed to load billing plans`}
      />
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
        actionButton={actionButton}
      >
        {!isDefined(currentWorkspace) ||
        !isBillingLoaded ||
        (isBillingEnabled && arePlansLoading) ? (
          <SettingsBillingContentSkeleton />
        ) : isPlansLoaded ? (
          children
        ) : (
          <SettingsBillingPlansErrorState onRetry={() => void refetchPlans()} />
        )}
      </SettingsPageLayout>
    </>
  );
};
