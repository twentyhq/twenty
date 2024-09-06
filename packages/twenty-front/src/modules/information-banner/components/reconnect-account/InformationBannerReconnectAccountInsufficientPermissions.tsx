import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { InformationBannerKeys } from '@/information-banner/enums/InformationBannerKeys.enum';
import { useAccountToReconnect } from '@/information-banner/hooks/useAccountToReconnect';
import { useTriggerGoogleApisOAuth } from '@/settings/accounts/hooks/useTriggerGoogleApisOAuth';
import { IconRefresh } from 'twenty-ui';

export const InformationBannerReconnectAccountInsufficientPermissions = () => {
  const { accountToReconnect } = useAccountToReconnect(
    InformationBannerKeys.ACCOUNTS_TO_RECONNECT_INSUFFICIENT_PERMISSIONS,
  );

  const { triggerGoogleApisOAuth } = useTriggerGoogleApisOAuth();

  if (!accountToReconnect) {
    return null;
  }

  return (
    <InformationBanner
      message={`Sincronização perdida com a mailbox ${accountToReconnect?.handle}. Por favor,
    reconecte para atualizar:`}
      buttonTitle="Reconectar"
      buttonIcon={IconRefresh}
      buttonOnClick={() => triggerGoogleApisOAuth()}
    />
  );
};
