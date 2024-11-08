import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useAccountToReconnect } from '@/information-banner/hooks/useAccountToReconnect';
import { InformationBannerKeys } from '@/information-banner/types/InformationBannerKeys';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { IconRefresh } from 'twenty-ui';

export const InformationBannerReconnectAccountInsufficientPermissions = () => {
  const { accountToReconnect } = useAccountToReconnect(
    InformationBannerKeys.ACCOUNTS_TO_RECONNECT_INSUFFICIENT_PERMISSIONS,
  );

  const { triggerApisOAuth } = useTriggerApisOAuth();

  if (!accountToReconnect) {
    return null;
  }

  return (
    <InformationBanner
      message={`Sync lost with mailbox ${accountToReconnect?.handle}. Please
    reconnect for updates:`}
      buttonTitle="Reconnect"
      buttonIcon={IconRefresh}
      buttonOnClick={() => triggerApisOAuth(accountToReconnect.provider)}
    />
  );
};
