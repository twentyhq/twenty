import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  PermissionFlagType,
  useBillingPortalSessionQuery,
} from '~/generated-metadata/graphql';

export const InformationBannerBillingSubscriptionPaused = () => {
  const { redirect } = useRedirect();

  const { data, loading } = useBillingPortalSessionQuery({
    variables: {
      returnUrlPath: getSettingsPath(SettingsPath.Billing),
    },
  });

  const {
    [PermissionFlagType.WORKSPACE]: hasPermissionToUpdateBillingDetails,
  } = usePermissionFlagMap();

  const openBillingPortal = () => {
    if (isDefined(data) && isDefined(data.billingPortalSession.url)) {
      redirect(data.billingPortalSession.url);
    }
  };

  return (
    <InformationBanner
      componentInstanceId="information-banner-billing-subscription-paused"
      variant="danger"
      message={
        hasPermissionToUpdateBillingDetails
          ? t`Trial expired. Please update your billing details.`
          : t`Trial expired. Please contact your admin`
      }
      buttonTitle={hasPermissionToUpdateBillingDetails ? t`Update` : undefined}
      buttonOnClick={() => openBillingPortal()}
      isButtonDisabled={loading || !isDefined(data)}
    />
  );
};
