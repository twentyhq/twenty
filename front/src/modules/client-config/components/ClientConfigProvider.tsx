import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { authProvidersState } from '@/client-config/states/authProvidersState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { isSignInPrefilledState } from '@/client-config/states/isSignInPrefilledState';
import { telemetryState } from '@/client-config/states/telemetryState';
import { useGetClientConfigQuery } from '~/generated/graphql';

export const ClientConfigProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [, setAuthProviders] = useRecoilState(authProvidersState);
  const [, setDebugMode] = useRecoilState(isDebugModeState);
  const [, setSignInPrefilled] = useRecoilState(isSignInPrefilledState);
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
      setSignInPrefilled(data?.clientConfig.signInPrefilled);
      setTelemetry(data?.clientConfig.telemetry);
    }
  }, [
    data,
    setAuthProviders,
    setDebugMode,
    setSignInPrefilled,
    setTelemetry,
    setIsLoading,
    loading,
  ]);

  return isLoading ? <></> : <>{children}</>;
};
