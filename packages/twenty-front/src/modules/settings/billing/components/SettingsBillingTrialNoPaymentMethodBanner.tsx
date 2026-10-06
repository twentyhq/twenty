import { Button } from 'twenty-ui/primitives/input';
import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { getSubscriptionPlanKey } from '@/settings/billing/utils/getSubscriptionPlanKey';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import {
  BillingPlanKey,
  BillingPortalSessionDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { formatDate } from '~/utils/date-utils';

type SettingsBillingTrialNoPaymentMethodBannerProps = {
  currentBillingSubscription: NonNullable<
    CurrentWorkspace['currentBillingSubscription']
  >;
};

export const SettingsBillingTrialNoPaymentMethodBanner = ({
  currentBillingSubscription,
}: SettingsBillingTrialNoPaymentMethodBannerProps) => {
  const { redirect } = useRedirect();

  const hasPermissionToManageBilling = useHasPermissionFlag(
    PermissionFlagType.BILLING,
  );

  const { data, error } = useQuery(BillingPortalSessionDocument, {
    variables: {
      returnUrlPath: getSettingsPath(SettingsPath.Billing),
      forPaymentMethodUpdate: true,
    },
    skip: !hasPermissionToManageBilling,
  });

  const openPaymentMethodUpdate = () => {
    if (isDefined(data?.billingPortalSession.url)) {
      redirect(data.billingPortalSession.url);
    }
  };

  const planName =
    getSubscriptionPlanKey(currentBillingSubscription) === BillingPlanKey.PRO
      ? t`pro plan`
      : t`organization plan`;

  const trialEndDate = isDefined(currentBillingSubscription.currentPeriodEnd)
    ? formatDate(currentBillingSubscription.currentPeriodEnd, 'MMM dd')
    : undefined;

  const message = isDefined(trialEndDate)
    ? hasPermissionToManageBilling
      ? t`Trial ends ${trialEndDate}, please add card details to keep the ${planName}`
      : t`Trial ends ${trialEndDate}. Please contact your admin to add card details to keep the ${planName}`
    : hasPermissionToManageBilling
      ? t`Trial ends soon, please add card details to keep the ${planName}`
      : t`Trial ends soon. Please contact your admin to add card details to keep the ${planName}`;

  return (
    <>
      <ToastOnQueryErrorEffect error={error} />
      <InlineBanner
        status="info"
        action={
          hasPermissionToManageBilling && (
            <Button
              size="sm"
              variant="outline"
              color="accent"
              onClick={openPaymentMethodUpdate}
            >{t`Add card`}</Button>
          )
        }
      >
        {message}
      </InlineBanner>
    </>
  );
};
