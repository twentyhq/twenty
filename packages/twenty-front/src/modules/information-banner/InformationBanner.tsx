import { currentUserState } from '@/auth/states/currentUserState';
import { InformationBannerAccountToReconnect } from '@/information-banner/InformationBannerReconnectAccount';
import { useRecoilValue } from 'recoil';

export enum InformationBannerKeys {
  ACCOUNTS_TO_RECONNECT = 'ACCOUNTS_TO_RECONNECT',
}

export const InformationBanner = () => {
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
