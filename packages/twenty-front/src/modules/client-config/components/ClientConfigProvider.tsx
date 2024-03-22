import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { authProvidersState } from '@/client-config/states/authProvidersState';
import { billingState } from '@/client-config/states/billingState';
import { captchaProviderState } from '@/client-config/states/captchaProviderState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { isSignInPrefilledState } from '@/client-config/states/isSignInPrefilledState';
import { isSignUpDisabledState } from '@/client-config/states/isSignUpDisabledState';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { telemetryState } from '@/client-config/states/telemetryState';
import { useGetClientConfigQuery } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const ClientConfigProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const setAuthProviders = useSetRecoilState(authProvidersState);
  const setIsDebugMode = useSetRecoilState(isDebugModeState);

  const setIsSignInPrefilled = useSetRecoilState(isSignInPrefilledState);
  const setIsSignUpDisabled = useSetRecoilState(isSignUpDisabledState);

  const setBilling = useSetRecoilState(billingState);
  const setTelemetry = useSetRecoilState(telemetryState);
  const setSupportChat = useSetRecoilState(supportChatState);

  const setSentryConfig = useSetRecoilState(sentryConfigState);

  const setCaptchaProvider = useSetRecoilState(captchaProviderState());

  const { data, loading } = useGetClientConfigQuery();

  useEffect(() => {
    if (isDefined(data?.clientConfig)) {
      setAuthProviders({
        google: data?.clientConfig.authProviders.google,
        password: data?.clientConfig.authProviders.password,
        magicLink: false,
      });
      setIsDebugMode(data?.clientConfig.debugMode);
      setIsSignInPrefilled(data?.clientConfig.signInPrefilled);
      setIsSignUpDisabled(data?.clientConfig.signUpDisabled);

      setBilling(data?.clientConfig.billing);
      setTelemetry(data?.clientConfig.telemetry);
      setSupportChat(data?.clientConfig.support);

      setSentryConfig({
        dsn: data?.clientConfig?.sentry?.dsn,
      });

      setCaptchaProvider({
        provider: data?.clientConfig.captcha.provider,
        siteKey: data?.clientConfig.captcha.siteKey,
      });
    }
  }, [
    data,
    setAuthProviders,
    setIsDebugMode,
    setIsSignInPrefilled,
    setIsSignUpDisabled,
    setTelemetry,
    setSupportChat,
    setBilling,
    setSentryConfig,
    setCaptchaProvider,
  ]);

  return loading ? <></> : <>{children}</>;
};
