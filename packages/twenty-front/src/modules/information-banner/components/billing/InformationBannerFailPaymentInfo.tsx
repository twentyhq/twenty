import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useQuery } from '@apollo/client/react';
import {
  PermissionFlagType,
  BillingPortalSessionDocument,
} from '~/generated-metadata/graphql';

export const InformationBannerFailPaymentInfo = () => {
  const { redirect } = useRedirect();

  const { data, loading } = useQuery(BillingPortalSessionDocument, {
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
      componentInstanceId="information-banner-fail-payment-info"
      color="danger"
      variant="secondary"
      message={
        hasPermissionToUpdateBillingDetails
          ? t`Last payment failed. Please update your billing details.`
          : t`Last payment failed. Please contact your admin.`
      }
      buttonTitle={hasPermissionToUpdateBillingDetails ? t`Update` : undefined}
      buttonOnClick={() => openBillingPortal()}
      isButtonDisabled={loading || !isDefined(data)}
    />
  );
};
