import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useHandleUpdateSubscription } from '@/settings/billing/hooks/useHandleUpdateSubscription';
import { useSettingsPermissionMap } from '@/settings/roles/hooks/useSettingsPermissionMap';
import { SettingsPath } from '@/types/SettingsPath';
import { useSubscriptioProvider } from '@/workspace/hooks/useSubscriptionProvider';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  BillingPaymentProviders,
  SettingPermissionType,
  SubscriptionStatus,
  useBillingPortalSessionQuery,
} from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const InformationBannerFailPaymentInfo = () => {
  const { redirect } = useRedirect();

  const subscriptionStatus = useSubscriptionStatus();

  const subscriptionPaymentProvider = useSubscriptioProvider();

  const { handleUpdateSubscription, loading: loadingUpdateSubscription } =
    useHandleUpdateSubscription();

  const { data, loading } = useBillingPortalSessionQuery({
    skip: subscriptionPaymentProvider === BillingPaymentProviders.Inter,
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
  const BANNER_MESSAGE_MAP = {
    [SubscriptionStatus.PastDue]: {
      [BillingPaymentProviders.Inter]: {
        admin: {
          message: t`Subscription expired. Click on the 'Download bank slip' button to download yor bank slip.`,
          buttonTitle: t`Download bank slip`,
        },
        member: {
          message: t`Subscription expired. Please contact your admin.`,
          buttonTitle: undefined,
        },
      },
      default: {
        admin: {
          message: t`Last payment failed. Please update your billing details.`,
          buttonTitle: t`Update`,
        },
        member: {
          message: t`Last payment failed. Please contact your admin.`,
          buttonTitle: undefined,
        },
      },
    },
  } as const;

  const getBannerMessagesFromSubscriptionStatus = (
    status?: SubscriptionStatus,
  ) => {
    const userType = hasPermissionToUpdateBillingDetails ? 'admin' : 'member';

    const providerMessages =
      BANNER_MESSAGE_MAP[status as SubscriptionStatus.PastDue]?.[
        subscriptionPaymentProvider as BillingPaymentProviders.Inter
      ] ?? BANNER_MESSAGE_MAP[status as SubscriptionStatus.PastDue]?.default;

    return (
      providerMessages?.[userType] ??
      BANNER_MESSAGE_MAP[SubscriptionStatus.PastDue].default[userType]
    );
  };

  return (
    <InformationBanner
      variant="danger"
      message={
        getBannerMessagesFromSubscriptionStatus(subscriptionStatus).message
      }
      buttonTitle={
        getBannerMessagesFromSubscriptionStatus(subscriptionStatus).buttonTitle
      }
      buttonOnClick={() => {
        if (subscriptionPaymentProvider === BillingPaymentProviders.Inter) {
          handleUpdateSubscription();
        } else {
          openBillingPortal();
        }
      }}
      isButtonDisabled={
        loading ||
        loadingUpdateSubscription ||
        (subscriptionPaymentProvider === BillingPaymentProviders.Stripe &&
          !isDefined(data))
      }
    />
  );
};
