import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { SettingsPath } from '@/types/SettingsPath';
import { isDefined } from 'twenty-shared';
import { useBillingPortalSessionQuery } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const InformationBannerBillingSubscriptionPaused = () => {
  const { redirect } = useRedirect();

  const { data, loading } = useBillingPortalSessionQuery({
    variables: {
      returnUrlPath: getSettingsPath(SettingsPath.Billing),
    },
  });

  const openBillingPortal = () => {
    if (isDefined(data) && isDefined(data.billingPortalSession.url)) {
      redirect(data.billingPortalSession.url);
    }
  };

  return (
    <InformationBanner
      variant="danger"
      message={'Trial expired. Please update your billing details'}
      buttonTitle="Update"
      buttonOnClick={() => openBillingPortal()}
      isButtonDisabled={loading || !isDefined(data)}
    />
  );
};
