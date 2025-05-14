import { BILLING_CHECKOUT_SESSION_DEFAULT_VALUE } from '@/billing/constants/BillingCheckoutSessionDefaultValue';
import { useHandleCheckoutSession } from '@/billing/hooks/useHandleCheckoutSession';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useSettingsPermissionMap } from '@/settings/roles/hooks/useSettingsPermissionMap';
import { t } from '@lingui/core/macro';
import { SettingPermissionType } from '~/generated-metadata/graphql';

export const InformationBannerNoBillingSubscription = () => {
  const { handleCheckoutSession, isSubmitting } = useHandleCheckoutSession({
    recurringInterval: BILLING_CHECKOUT_SESSION_DEFAULT_VALUE.interval,
    plan: BILLING_CHECKOUT_SESSION_DEFAULT_VALUE.plan,
    requirePaymentMethod: true,
  });

  const { [SettingPermissionType.WORKSPACE]: hasPermissionToSubscribe } =
    useSettingsPermissionMap();

  return (
    <InformationBanner
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
