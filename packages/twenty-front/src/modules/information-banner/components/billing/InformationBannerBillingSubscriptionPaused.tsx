import { useToastOnQueryError } from '@/apollo/hooks/useToastOnQueryError';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  BillingPortalSessionDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const InformationBannerBillingSubscriptionPaused = () => {
  const { redirect } = useRedirect();

  const { [PermissionFlagType.BILLING]: hasPermissionToUpdateBillingDetails } =
    usePermissionFlagMap();

  const { data, loading, error } = useQuery(BillingPortalSessionDocument, {
    variables: {
      returnUrlPath: getSettingsPath(SettingsPath.Billing),
    },
    skip: !hasPermissionToUpdateBillingDetails,
  });

  useToastOnQueryError(error);

  const openBillingPortal = () => {
    if (isDefined(data) && isDefined(data.billingPortalSession.url)) {
      redirect(data.billingPortalSession.url);
    }
  };

  return (
    <InformationBanner
      componentInstanceId="information-banner-billing-subscription-paused"
      color="danger"
      variant="secondary"
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
