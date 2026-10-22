import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/settings/billing/constants/BillingCheckoutSessionDefaultValue';
import { useHandleCheckoutSession } from '@/settings/billing/hooks/useHandleCheckoutSession';
import { usePlans } from '@/settings/billing/hooks/usePlans';
import { getCheckoutPlanKeyOrThrow } from '@/settings/billing/utils/getCheckoutPlanKeyOrThrow';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  type BillingPlanKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

type InformationBannerNoBillingSubscriptionContentProps = {
  planKey: BillingPlanKey;
};

const InformationBannerNoBillingSubscriptionContent = ({
  planKey,
}: InformationBannerNoBillingSubscriptionContentProps) => {
  const { handleCheckoutSession, isSubmitting } = useHandleCheckoutSession({
    recurringInterval: BILLING_CHECKOUT_SESSION_DEFAULT_VALUE.interval,
    plan: planKey,
    requirePaymentMethod: true,
    successUrlPath: getSettingsPath(SettingsPath.Billing),
  });

  const hasPermissionToSubscribe = useHasPermissionFlag(
    PermissionFlagType.WORKSPACE,
  );

  return (
    <InformationBanner
      componentInstanceId="information-banner-no-billing-subscription"
      status="error"
      variant="soft"
      message={
        hasPermissionToSubscribe
          ? t`Your workspace doesn't have an active subscription.`
          : t`Your workspace doesn't have an active subscription. Please contact your admin.`
      }
      buttonTitle={hasPermissionToSubscribe ? t`Subscribe` : undefined}
      buttonOnClick={() => handleCheckoutSession()}
      isButtonDisabled={isSubmitting}
    />
  );
};

export const InformationBannerNoBillingSubscription = () => {
  const { isPlansLoaded, listPlans } = usePlans();

  if (!isPlansLoaded) {
    return null;
  }

  return (
    <InformationBannerNoBillingSubscriptionContent
      planKey={getCheckoutPlanKeyOrThrow({ plans: listPlans() })}
    />
  );
};
