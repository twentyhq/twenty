import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useAccountToReconnect } from '@/information-banner/hooks/useAccountToReconnect';
import { InformationBannerKeys } from '@/information-banner/types/InformationBannerKeys';
import { useTriggerProviderReconnect } from '@/settings/accounts/hooks/useTriggerProviderReconnect';
import { IconRefresh } from 'twenty-ui/display';

export const InformationBannerReconnectAccountEmailAliases = () => {
  const { accountToReconnect } = useAccountToReconnect(
    InformationBannerKeys.ACCOUNTS_TO_RECONNECT_EMAIL_ALIASES,
  );

  const { triggerProviderReconnect } = useTriggerProviderReconnect();

  if (!accountToReconnect) {
    return null;
  }

  return (
    <InformationBanner
      message={`Please reconnect your mailbox ${accountToReconnect.handle} to update your email aliases:`}
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
