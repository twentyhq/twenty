import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useAccountToReconnect } from '@/information-banner/hooks/useAccountToReconnect';
import { useDismissReconnectAccountBanner } from '@/information-banner/hooks/useDismissReconnectAccountBanner';
import { InformationBannerKeys } from '@/information-banner/types/InformationBannerKeys';
import { useTriggerProviderReconnect } from '@/settings/accounts/hooks/useTriggerProviderReconnect';
import { t } from '@lingui/core/macro';
import { IconRefresh } from 'twenty-ui/display';

const COMPONENT_INSTANCE_ID =
  'information-banner-reconnect-account-insufficient-permissions';

export const InformationBannerReconnectAccountInsufficientPermissions = () => {
  const { accountToReconnect } = useAccountToReconnect(
    InformationBannerKeys.ACCOUNTS_TO_RECONNECT_INSUFFICIENT_PERMISSIONS,
  );

  const { triggerProviderReconnect } = useTriggerProviderReconnect();
  const { dismissReconnectAccountBanner } = useDismissReconnectAccountBanner(
    COMPONENT_INSTANCE_ID,
  );

  if (!accountToReconnect) {
    return null;
  }

  const handleDismiss = async () => {
    await dismissReconnectAccountBanner(accountToReconnect.id);
  };

  const mailboxHandle = accountToReconnect.handle;

  return (
    <InformationBanner
      componentInstanceId={COMPONENT_INSTANCE_ID}
      message={t`Sync lost with mailbox ${mailboxHandle}. Please reconnect for updates:`}
      buttonTitle={t`Reconnect`}
      buttonIcon={IconRefresh}
      buttonOnClick={() =>
        triggerProviderReconnect(
          accountToReconnect.provider,
          accountToReconnect.id,
        )
      }
      onClose={handleDismiss}
    />
  );
};
