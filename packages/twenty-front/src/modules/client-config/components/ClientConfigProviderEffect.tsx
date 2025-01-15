import { apiConfigState } from '@/client-config/states/apiConfigState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { billingState } from '@/client-config/states/billingState';
import { canManageFeatureFlagsState } from '@/client-config/states/canManageFeatureFlagsState';
import { captchaProviderState } from '@/client-config/states/captchaProviderState';
import { chromeExtensionIdState } from '@/client-config/states/chromeExtensionIdState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isAnalyticsEnabledState } from '@/client-config/states/isAnalyticsEnabledState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { isDeveloperDefaultSignInPrefilledState } from '@/client-config/states/isDeveloperDefaultSignInPrefilledState';
import { isEmailVerificationRequiredState } from '@/client-config/states/isEmailVerificationRequiredState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useGetClientConfigQuery } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const ClientConfigProviderEffect = () => {
  const setIsDebugMode = useSetRecoilState(isDebugModeState);
  const setIsAnalyticsEnabled = useSetRecoilState(isAnalyticsEnabledState);
  const setDomainConfiguration = useSetRecoilState(domainConfigurationState);
  const setAuthProviders = useSetRecoilState(authProvidersState);

  const setIsDeveloperDefaultSignInPrefilled = useSetRecoilState(
    isDeveloperDefaultSignInPrefilledState,
  );
  const setIsMultiWorkspaceEnabled = useSetRecoilState(
    isMultiWorkspaceEnabledState,
  );
  const setIsEmailVerificationRequired = useSetRecoilState(
    isEmailVerificationRequiredState,
  );

  const setBilling = useSetRecoilState(billingState);
  const setSupportChat = useSetRecoilState(supportChatState);

  const setSentryConfig = useSetRecoilState(sentryConfigState);
  const [clientConfigApiStatus, setClientConfigApiStatus] = useRecoilState(
    clientConfigApiStatusState,
  );

  const setCaptchaProvider = useSetRecoilState(captchaProviderState);

  const setChromeExtensionId = useSetRecoilState(chromeExtensionIdState);

  const setApiConfig = useSetRecoilState(apiConfigState);

  const setCanManageFeatureFlags = useSetRecoilState(
    canManageFeatureFlagsState,
  );

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
    setIsDeveloperDefaultSignInPrefilled(data?.clientConfig.signInPrefilled);
    setIsMultiWorkspaceEnabled(data?.clientConfig.isMultiWorkspaceEnabled);
    setIsEmailVerificationRequired(
      data?.clientConfig.isEmailVerificationRequired,
    );
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
    setDomainConfiguration({
      defaultSubdomain: data?.clientConfig?.defaultSubdomain,
      frontDomain: data?.clientConfig?.frontDomain,
    });
    setCanManageFeatureFlags(data?.clientConfig?.canManageFeatureFlags);
  }, [
    data,
    setIsDebugMode,
    setIsDeveloperDefaultSignInPrefilled,
    setIsMultiWorkspaceEnabled,
    setIsEmailVerificationRequired,
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
    setDomainConfiguration,
    setAuthProviders,
    setCanManageFeatureFlags,
  ]);

  return <></>;
};
