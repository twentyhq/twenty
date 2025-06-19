import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useAccountToReconnect } from '@/information-banner/hooks/useAccountToReconnect';
import { InformationBannerKeys } from '@/information-banner/types/InformationBannerKeys';
import { useTriggerProviderReconnect } from '@/settings/accounts/hooks/useTriggerProviderReconnect';
import { IconRefresh } from 'twenty-ui/display';

export const InformationBannerReconnectAccountInsufficientPermissions = () => {
  const { accountToReconnect } = useAccountToReconnect(
    InformationBannerKeys.ACCOUNTS_TO_RECONNECT_INSUFFICIENT_PERMISSIONS,
  );

  const { triggerProviderReconnect } = useTriggerProviderReconnect();

  if (!accountToReconnect) {
    return null;
  }

  return (
    <InformationBanner
      message={`Sync lost with mailbox ${accountToReconnect.handle}. Please
    reconnect for updates:`}
      buttonTitle="Reconnect"
      buttonIcon={IconRefresh}
      buttonOnClick={() =>
        triggerProviderReconnect(
          accountToReconnect.provider,
          accountToReconnect.id,
        )
      }
    />
  );
};
