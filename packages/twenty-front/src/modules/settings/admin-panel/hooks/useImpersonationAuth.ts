import { useMetadataStore } from '@/app/hooks/useMetadataStore';
import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { useAuth } from '@/auth/hooks/useAuth';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';

export const useImpersonationAuth = () => {
  const { getAuthTokensFromLoginToken } = useAuth();
  const { resetMetadataStore } = useMetadataStore();
  const setIsAppEffectRedirectEnabled = useSetRecoilStateV2(
    isAppEffectRedirectEnabledState,
  );

  const executeImpersonationAuth = async (loginToken: string) => {
    resetMetadataStore();
    setIsAppEffectRedirectEnabled(false);
    await getAuthTokensFromLoginToken(loginToken);
    setIsAppEffectRedirectEnabled(true);
  };

  return { executeImpersonationAuth };
};
