import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentUserState } from '@/auth/states/currentUserState';
import { InformationBannerKeys } from '@/information-banner/components/InformationBannerWrapper';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useTriggerGoogleApisOAuth } from '@/settings/accounts/hooks/useTriggerGoogleApisOAuth';
import { Button } from '@/ui/input/button/components/Button';
import { useRecoilValue } from 'recoil';
import { Banner, IconRefresh } from 'twenty-ui';

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
    <Banner>
      Sync lost with mailbox {accountToReconnect?.record?.handle}. Please
      reconnect for updates:
      <Button
        variant="secondary"
        title="Reconnect"
        Icon={IconRefresh}
        size="small"
        inverted
        onClick={() => triggerGoogleApisOAuth()}
      />
    </Banner>
  );
};
