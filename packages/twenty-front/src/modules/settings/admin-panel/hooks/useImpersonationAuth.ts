import { useAuth } from '@/auth/hooks/useAuth';
import { isAppWaitingForFreshObjectMetadataState } from '@/object-metadata/states/isAppWaitingForFreshObjectMetadataState';
import { useSetRecoilState } from 'recoil';

export const useImpersonationAuth = () => {
  const { getAccessTokensFromLoginToken } = useAuth();
  const setIsAppWaitingForFreshObjectMetadata = useSetRecoilState(
    isAppWaitingForFreshObjectMetadataState,
  );

  const executeImpersonationAuth = async (loginToken: string) => {
    setIsAppWaitingForFreshObjectMetadata(true);
    await getAccessTokensFromLoginToken(loginToken);
    setIsAppWaitingForFreshObjectMetadata(false);
  };

  return { executeImpersonationAuth };
};
