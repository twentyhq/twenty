import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { isDefined } from 'twenty-ui';
import {
  SubscriptionStatus,
  useBillingPortalSessionQuery,
} from '~/generated/graphql';

export const InformationBannerBillingSubscriptionPaused = () => {
  const subscriptionStatus = useSubscriptionStatus();

  const { data, loading } = useBillingPortalSessionQuery({
    variables: {
      returnUrlPath: `${AppPath.Settings}/${SettingsPath.Billing}`,
    },
  });

  if (subscriptionStatus !== SubscriptionStatus.Paused) {
    return null;
  }

  const openBillingPortal = () => {
    if (isDefined(data) && isDefined(data.billingPortalSession.url)) {
      window.location.replace(data.billingPortalSession.url);
    }
  };

  return (
    <InformationBanner
      variant="danger"
      message={`Trial expired. Please update your billing details`}
      buttonTitle="Update"
      buttonOnClick={() => openBillingPortal()}
      isButtonDisabled={loading || !isDefined(data)}
    />
  );
};
