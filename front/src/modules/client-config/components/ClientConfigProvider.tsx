import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { authProvidersState } from '@/client-config/states/authProvidersState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { isDemoModeState } from '@/client-config/states/isDemoModeState';
import { telemetryState } from '@/client-config/states/telemetryState';
import { useGetClientConfigQuery } from '~/generated/graphql';

export const ClientConfigProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  console.log('ClientConfigProvider');
  const [, setAuthProviders] = useRecoilState(authProvidersState);
  const [, setDebugMode] = useRecoilState(isDebugModeState);
  const [, setDemoMode] = useRecoilState(isDemoModeState);
  const [, setTelemetry] = useRecoilState(telemetryState);
  const [isLoading, setIsLoading] = useState(true);

  const { data, loading } = useGetClientConfigQuery();

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
    }
    if (data?.clientConfig) {
      setAuthProviders({
        google: data?.clientConfig.authProviders.google,
        password: data?.clientConfig.authProviders.password,
        magicLink: false,
      });
      setDebugMode(data?.clientConfig.debugMode);
      setDemoMode(data?.clientConfig.demoMode);
      setTelemetry(data?.clientConfig.telemetry);
    }
  }, [
    data,
    setAuthProviders,
    setDebugMode,
    setDemoMode,
    setTelemetry,
    setIsLoading,
    loading,
  ]);

  return isLoading ? <></> : <>{children}</>;
};
