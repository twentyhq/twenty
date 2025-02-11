import { useAuth } from '@/auth/hooks/useAuth';
import { isAppWaitingForFreshObjectMetadataState } from '@/object-metadata/states/isAppWaitingForFreshObjectMetadataState';
import { useSetRecoilState } from 'recoil';

export const useImpersonationAuth = () => {
  const { getAuthTokensFromLoginToken } = useAuth();
  const setIsAppWaitingForFreshObjectMetadata = useSetRecoilState(
    isAppWaitingForFreshObjectMetadataState,
  );

  const executeImpersonationAuth = async (loginToken: string) => {
    setIsAppWaitingForFreshObjectMetadata(true);
    await getAuthTokensFromLoginToken(loginToken);
    setIsAppWaitingForFreshObjectMetadata(false);
  };

  return { executeImpersonationAuth };
};
