import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentUserState } from '@/auth/states/currentUserState';
import { InformationBanner } from '@/information-banner/components/InformationBanner';
import { InformationBannerKeys } from '@/information-banner/components/InformationBannerWrapper';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useTriggerGoogleApisOAuth } from '@/settings/accounts/hooks/useTriggerGoogleApisOAuth';
import { useRecoilValue } from 'recoil';
import { IconRefresh } from 'twenty-ui';

export const InformationBannerAccountToReconnect = () => {
  const currentUser = useRecoilValue(currentUserState);

  const userVars = currentUser?.userVars;

  const firstAccountIdToReconnect =
    userVars?.[InformationBannerKeys.ACCOUNTS_TO_RECONNECT]?.[0];

  const accountToReconnect = useFindOneRecord<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    objectRecordId: firstAccountIdToReconnect,
    skip: !firstAccountIdToReconnect,
  });

  const { triggerGoogleApisOAuth } = useTriggerGoogleApisOAuth();

  if (!accountToReconnect?.record) {
    return null;
  }

  return (
    <InformationBanner
      message={`Sync lost with mailbox ${accountToReconnect?.record?.handle}. Please
    reconnect for updates:`}
      buttonTitle="Reconnect"
      buttonIcon={IconRefresh}
      buttonOnClick={() => triggerGoogleApisOAuth()}
    />
  );
};
