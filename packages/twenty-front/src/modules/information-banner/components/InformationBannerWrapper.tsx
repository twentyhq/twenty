import { currentUserState } from '@/auth/states/currentUserState';
import { InformationBannerAccountToReconnect } from '@/information-banner/components/InformationBannerReconnectAccount';
import { useRecoilValue } from 'recoil';

export enum InformationBannerKeys {
  ACCOUNTS_TO_RECONNECT = 'ACCOUNTS_TO_RECONNECT',
}

export const InformationBannerWrapper = () => {
  const currentUser = useRecoilValue(currentUserState);

  const userVars = currentUser?.userVars;

  const firstAccountIdToReconnect =
    userVars?.[InformationBannerKeys.ACCOUNTS_TO_RECONNECT]?.[0];

  return (
    <>
      {firstAccountIdToReconnect && (
        <InformationBannerAccountToReconnect
          accountIdToReconnect={firstAccountIdToReconnect}
        />
      )}
    </>
  );
};
