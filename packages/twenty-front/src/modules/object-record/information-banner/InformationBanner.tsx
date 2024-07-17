import { currentUserState } from '@/auth/states/currentUserState';
import { Button } from '@/ui/input/button/components/Button';
import { useRecoilValue } from 'recoil';
import { Banner, IconRefresh } from 'twenty-ui';

export const InformationBanner = () => {
  const currentUser = useRecoilValue(currentUserState);

  const userVars = currentUser?.userVars;

  const accountsToReconnect = userVars?.['ACCOUNTS_TO_RECONNECT'] ?? [];

  if (accountsToReconnect.length === 0) {
    return null;
  }

  return (
    <Banner>
      Sync lost with mailbox {accountsToReconnect[0]}. Please reconnect for
      updates:
      <Button
        variant="secondary"
        title="Reconnect"
        Icon={IconRefresh}
        size="small"
        inverted
      />
    </Banner>
  );
};
