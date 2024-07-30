import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useTriggerGoogleApisOAuth } from '@/settings/accounts/hooks/useTriggerGoogleApisOAuth';
import { Button } from '@/ui/input/button/components/Button';
import { Banner, IconRefresh } from 'twenty-ui';

export const InformationBannerAccountToReconnect = ({
  accountIdToReconnect,
}: {
  accountIdToReconnect: string;
}) => {
  const accountToReconnect = useFindOneRecord<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    objectRecordId: accountIdToReconnect,
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
