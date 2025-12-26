import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import { useHandleCheckoutSession } from '@/billing/hooks/useHandleCheckoutSession';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const InformationBannerNoBillingSubscription = () => {
  const { handleCheckoutSession, isSubmitting } = useHandleCheckoutSession({
    recurringInterval: BILLING_CHECKOUT_SESSION_DEFAULT_VALUE.interval,
    plan: BILLING_CHECKOUT_SESSION_DEFAULT_VALUE.plan,
    requirePaymentMethod: true,
    successUrlPath: getSettingsPath(SettingsPath.Billing),
  });

  const { [PermissionFlagType.WORKSPACE]: hasPermissionToSubscribe } =
    usePermissionFlagMap();

  return (
    <InformationBanner
      componentInstanceId="information-banner-no-billing-subscription"
      variant="danger"
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
