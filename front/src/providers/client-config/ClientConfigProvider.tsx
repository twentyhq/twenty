import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { useFetchClientConfig } from '@/auth/hooks/useFetchClientConfig';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { isDemoModeState } from '@/client-config/states/isDemoModeState';
import { telemetryState } from '@/client-config/states/telemetryState';

export const ClientConfigProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [, setAuthProviders] = useRecoilState(authProvidersState);
  const [, setDebugMode] = useRecoilState(isDebugModeState);
  const [, setDemoMode] = useRecoilState(isDemoModeState);
  const [, setTelemetry] = useRecoilState(telemetryState);

  const clientConfig = useFetchClientConfig();

  useEffect(() => {
    if (clientConfig) {
      setAuthProviders({
        google: clientConfig.authProviders.google,
        password: clientConfig.authProviders.password,
        magicLink: false,
      });
      setDebugMode(clientConfig.debugMode);
      setDemoMode(clientConfig.demoMode);
      setTelemetry(clientConfig.telemetry);
    }
  }, [clientConfig, setAuthProviders, setDebugMode, setDemoMode, setTelemetry]);

  return <>{children}</>;
};
