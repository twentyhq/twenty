import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { useAuth } from '@/auth/hooks/useAuth';
import { shouldAppBeLoadingState } from '@/object-metadata/states/shouldAppBeLoadingState';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';

export const useImpersonationAuth = () => {
  const { getAuthTokensFromLoginToken } = useAuth();
  const setShouldAppBeLoading = useSetRecoilStateV2(shouldAppBeLoadingState);
  const setIsAppEffectRedirectEnabled = useSetRecoilStateV2(
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
