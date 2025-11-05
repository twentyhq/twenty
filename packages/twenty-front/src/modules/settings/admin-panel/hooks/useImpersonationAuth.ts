import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { useAuth } from '@/auth/hooks/useAuth';
import { shouldAppBeLoadingState } from '@/object-metadata/states/shouldAppBeLoadingState';
import { useSetRecoilState } from 'recoil';

export const useImpersonationAuth = () => {
  const { getAuthTokensFromLoginToken } = useAuth();
  const setShouldAppBeLoading = useSetRecoilState(shouldAppBeLoadingState);
  const setIsAppEffectRedirectEnabled = useSetRecoilState(
    isAppEffectRedirectEnabledState,
  );

  const executeImpersonationAuth = async (loginToken: string) => {
    setShouldAppBeLoading(true);
    setIsAppEffectRedirectEnabled(false);
    await getAuthTokensFromLoginToken(loginToken);
    setShouldAppBeLoading(false);
    setIsAppEffectRedirectEnabled(true);
  };

  return { executeImpersonationAuth };
};
