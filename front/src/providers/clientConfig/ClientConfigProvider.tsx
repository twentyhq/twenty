import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { useFetchClientConfig } from '@/auth/hooks/useFetchClientConfig';
import { displayGoogleLogin } from '@/auth/states/displayGoogleLogin';
import { prefillLoginWithSeed } from '@/auth/states/prefillLoginWithSeed';

export const ClientConfigProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [, setDisplayGoogleLogin] = useRecoilState(displayGoogleLogin);
  const [, setPrefillLoginWithSeed] = useRecoilState(prefillLoginWithSeed);
  const clientConfig = useFetchClientConfig();

  useEffect(() => {
    setDisplayGoogleLogin(clientConfig?.display_google_login ?? true);
    setPrefillLoginWithSeed(clientConfig?.prefill_login_with_seed ?? true);
  }, [setDisplayGoogleLogin, setPrefillLoginWithSeed, clientConfig]);

  return <>{children}</>;
};
