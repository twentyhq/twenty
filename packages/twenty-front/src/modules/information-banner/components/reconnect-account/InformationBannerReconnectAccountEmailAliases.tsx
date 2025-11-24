import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { useAccountToReconnect } from '@/information-banner/hooks/useAccountToReconnect';
import { useDismissReconnectAccountBanner } from '@/information-banner/hooks/useDismissReconnectAccountBanner';
import { InformationBannerKeys } from '@/information-banner/types/InformationBannerKeys';
import { useTriggerProviderReconnect } from '@/settings/accounts/hooks/useTriggerProviderReconnect';
import { IconRefresh } from 'twenty-ui/display';

const COMPONENT_INSTANCE_ID =
  'information-banner-reconnect-account-email-aliases';

export const InformationBannerReconnectAccountEmailAliases = () => {
  const { accountToReconnect } = useAccountToReconnect(
    InformationBannerKeys.ACCOUNTS_TO_RECONNECT_EMAIL_ALIASES,
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

  return (
    <InformationBanner
      componentInstanceId={COMPONENT_INSTANCE_ID}
      message={`Please reconnect your mailbox ${accountToReconnect.handle} to update your email aliases:`}
      buttonTitle="Reconnect"
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
