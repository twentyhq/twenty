import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentUserState } from '@/auth/states/currentUserState';
import { type InformationBannerKeys } from '@/information-banner/types/InformationBannerKeys';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useRecoilValue } from 'recoil';

export const useAccountToReconnect = (key: InformationBannerKeys) => {
  const currentUser = useRecoilValue(currentUserState);

  const userVars = currentUser?.userVars;

  const firstAccountIdToReconnect = userVars?.[key]?.[0];

  const accountToReconnect = useFindOneRecord<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    objectRecordId: firstAccountIdToReconnect,
    skip: !firstAccountIdToReconnect,
  });

  return {
    accountToReconnect: accountToReconnect?.record,
  };
};
