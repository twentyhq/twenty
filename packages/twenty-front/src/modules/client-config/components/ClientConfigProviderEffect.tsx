import { apiConfigState } from '@/client-config/states/apiConfigState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { billingState } from '@/client-config/states/billingState';
import { captchaProviderState } from '@/client-config/states/captchaProviderState';
import { chromeExtensionIdState } from '@/client-config/states/chromeExtensionIdState';
import { isAnalyticsEnabledState } from '@/client-config/states/isAnalyticsEnabledState';
import { isClientConfigLoadedState } from '@/client-config/states/isClientConfigLoadedState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { isSignInPrefilledState } from '@/client-config/states/isSignInPrefilledState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
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

  const setIsSignInPrefilled = useSetRecoilState(isSignInPrefilledState);
  const setIsMultiworkspaceEnabled = useSetRecoilState(
    isMultiWorkspaceEnabledState,
  );

  const setBilling = useSetRecoilState(billingState);
  const setSupportChat = useSetRecoilState(supportChatState);

  const setSentryConfig = useSetRecoilState(sentryConfigState);
  const [isClientConfigLoaded, setIsClientConfigLoaded] = useRecoilState(
    isClientConfigLoadedState,
  );

  const setCaptchaProvider = useSetRecoilState(captchaProviderState);

  const setChromeExtensionId = useSetRecoilState(chromeExtensionIdState);

  const setApiConfig = useSetRecoilState(apiConfigState);

  const { data, loading } = useGetClientConfigQuery({
    skip: isClientConfigLoaded,
  });

  useEffect(() => {
    if (!loading && isDefined(data?.clientConfig)) {
      setIsClientConfigLoaded(true);
      setAuthProviders({
        google: data?.clientConfig.authProviders.google,
        microsoft: data?.clientConfig.authProviders.microsoft,
        password: data?.clientConfig.authProviders.password,
        magicLink: false,
        sso: data?.clientConfig.authProviders.sso,
      });
      setIsDebugMode(data?.clientConfig.debugMode);
      setIsAnalyticsEnabled(data?.clientConfig.analyticsEnabled);
      setIsSignInPrefilled(data?.clientConfig.signInPrefilled);
      setIsMultiworkspaceEnabled(data?.clientConfig.isMultiworkspaceEnabled);

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
    }
  }, [
    data,
    setAuthProviders,
    setIsDebugMode,
    setIsSignInPrefilled,
    setIsMultiworkspaceEnabled,
    setSupportChat,
    setBilling,
    setSentryConfig,
    loading,
    setIsClientConfigLoaded,
    setCaptchaProvider,
    setChromeExtensionId,
    setApiConfig,
    setIsAnalyticsEnabled,
  ]);

  return <></>;
};
