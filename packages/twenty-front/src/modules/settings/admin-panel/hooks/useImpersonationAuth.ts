import { useAuth } from '@/auth/hooks/useAuth';
import { isAppWaitingForFreshObjectMetadataState } from '@/object-metadata/states/isAppWaitingForFreshObjectMetadataState';
import { useSetRecoilState } from 'recoil';
import { cookieStorage } from '~/utils/cookie-storage';

export const useImpersonationAuth = () => {
  const { getAuthTokensFromLoginToken } = useAuth();
  const setIsAppWaitingForFreshObjectMetadata = useSetRecoilState(
    isAppWaitingForFreshObjectMetadataState,
  );

  const executeImpersonationAuth = async (loginToken: string) => {
    setIsAppWaitingForFreshObjectMetadata(true);
    cookieStorage.setItem('impersonationTokenPair', 'true');
    await getAuthTokensFromLoginToken(loginToken);
    setIsAppWaitingForFreshObjectMetadata(false);
  };

  return { executeImpersonationAuth };
};
