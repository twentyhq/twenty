import { apiConfigState } from '@/client-config/states/apiConfigState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { billingState } from '@/client-config/states/billingState';
import { captchaProviderState } from '@/client-config/states/captchaProviderState';
import { chromeExtensionIdState } from '@/client-config/states/chromeExtensionIdState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isAnalyticsEnabledState } from '@/client-config/states/isAnalyticsEnabledState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { isDeveloperDefaultSignInPrefilledState } from '@/client-config/states/isDeveloperDefaultSignInPrefilledState';
import { isSignUpDisabledState } from '@/client-config/states/isSignUpDisabledState';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useGetClientConfigQuery } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const ClientConfigProviderEffect = () => {
  const setAuthProviders = useSetRecoilState(authProvidersState);
  const setIsDebugMode = useSetRecoilState(isDebugModeState);
  const setIsAnalyticsEnabled = useSetRecoilState(isAnalyticsEnabledState);

  const setisDeveloperDefaultSignInPrefilled = useSetRecoilState(
    isDeveloperDefaultSignInPrefilledState,
  );
  const setIsSignUpDisabled = useSetRecoilState(isSignUpDisabledState);

  const setBilling = useSetRecoilState(billingState);
  const setSupportChat = useSetRecoilState(supportChatState);

  const setSentryConfig = useSetRecoilState(sentryConfigState);
  const [clientConfigApiStatus, setClientConfigApiStatus] = useRecoilState(
    clientConfigApiStatusState,
  );

  const setCaptchaProvider = useSetRecoilState(captchaProviderState);

  const setChromeExtensionId = useSetRecoilState(chromeExtensionIdState);

  const setApiConfig = useSetRecoilState(apiConfigState);

  const { data, loading, error } = useGetClientConfigQuery({
    skip: clientConfigApiStatus.isLoaded,
  });

  useEffect(() => {
    if (loading) return;
    setClientConfigApiStatus((currentStatus) => ({
      ...currentStatus,
      isLoaded: true,
    }));

    if (error instanceof Error) {
      setClientConfigApiStatus((currentStatus) => ({
        ...currentStatus,
        isErrored: true,
        error,
      }));
      return;
    }

    if (!isDefined(data?.clientConfig)) {
      return;
    }

    setClientConfigApiStatus((currentStatus) => ({
      ...currentStatus,
      isErrored: false,
      error: undefined,
    }));

    setAuthProviders({
      google: data?.clientConfig.authProviders.google,
      microsoft: data?.clientConfig.authProviders.microsoft,
      password: data?.clientConfig.authProviders.password,
      magicLink: false,
      sso: data?.clientConfig.authProviders.sso,
    });
    setIsDebugMode(data?.clientConfig.debugMode);
    setIsAnalyticsEnabled(data?.clientConfig.analyticsEnabled);
    setisDeveloperDefaultSignInPrefilled(data?.clientConfig.signInPrefilled);
    setIsSignUpDisabled(data?.clientConfig.signUpDisabled);

    setBilling(data?.clientConfig.billing);
    setSupportChat(data?.clientConfig.support);

    setSentryConfig({
      dsn: data?.clientConfig?.sentry?.dsn,
      release: data?.clientConfig?.sentry?.release,
      environment: data?.clientConfig?.sentry?.environment,
    });

    setCaptchaProvider({
      provider: data?.clientConfig?.captcha?.provider,
      siteKey: data?.clientConfig?.captcha?.siteKey,
    });

    setChromeExtensionId(data?.clientConfig?.chromeExtensionId);
    setApiConfig(data?.clientConfig?.api);
  }, [
    data,
    setAuthProviders,
    setIsDebugMode,
    setisDeveloperDefaultSignInPrefilled,
    setIsSignUpDisabled,
    setSupportChat,
    setBilling,
    setSentryConfig,
    loading,
    setClientConfigApiStatus,
    setCaptchaProvider,
    setChromeExtensionId,
    setApiConfig,
    setIsAnalyticsEnabled,
    error,
  ]);

  return <></>;
};
