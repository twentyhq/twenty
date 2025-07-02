import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useSettingsPermissionMap } from '@/settings/roles/hooks/useSettingsPermissionMap';
import { SettingsPath } from '@/types/SettingsPath';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  SettingPermissionType,
  useBillingPortalSessionQuery,
} from '~/generated-metadata/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const InformationBannerFailPaymentInfo = () => {
  const { redirect } = useRedirect();

  const { data, loading } = useBillingPortalSessionQuery({
    variables: {
      returnUrlPath: getSettingsPath(SettingsPath.Billing),
    },
  });

  const {
    [SettingPermissionType.WORKSPACE]: hasPermissionToUpdateBillingDetails,
  } = useSettingsPermissionMap();

  const openBillingPortal = () => {
    if (isDefined(data) && isDefined(data.billingPortalSession.url)) {
      redirect(data.billingPortalSession.url);
    }
  };

  return (
    <InformationBanner
      variant="danger"
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
