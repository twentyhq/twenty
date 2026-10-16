import { ToastOnQueryErrorEffect } from '@/apollo/components/ToastOnQueryErrorEffect';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { BILLING_PLAN_LABELS } from '@/settings/billing/constants/BillingPlanLabels';
import { getSubscriptionPlanKey } from '@/settings/billing/utils/getSubscriptionPlanKey';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import {
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

  const planKey = getSubscriptionPlanKey(currentBillingSubscription);
  const billingPlanLabel = isDefined(planKey)
    ? t(BILLING_PLAN_LABELS[planKey])
    : undefined;
  const planName = isDefined(billingPlanLabel)
    ? t`${billingPlanLabel} plan`
    : t`current plan`;

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
            <InlineBanner.Action
              onClick={openPaymentMethodUpdate}
            >{t`Add card`}</InlineBanner.Action>
          )
        }
      >
        {message}
      </InlineBanner>
    </>
  );
};
