import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { useAuth } from '@/auth/hooks/useAuth';
import { useClearSseClient } from '@/sse-db-event/hooks/useClearSseClient';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useImpersonationAuth = () => {
  const { getAuthTokensFromLoginToken } = useAuth();
  const { clearSseClient } = useClearSseClient();
  const setIsAppEffectRedirectEnabled = useSetAtomState(
    isAppEffectRedirectEnabledState,
  );

  const executeImpersonationAuth = async (loginToken: string) => {
    setIsAppEffectRedirectEnabled(false);
    clearSseClient();
    await getAuthTokensFromLoginToken(loginToken);
    setIsAppEffectRedirectEnabled(true);
  };

  return { executeImpersonationAuth };
};
