import { apiConfigState } from '@/client-config/states/apiConfigState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { billingState } from '@/client-config/states/billingState';
import { canManageFeatureFlagsState } from '@/client-config/states/canManageFeatureFlagsState';
import { captchaState } from '@/client-config/states/captchaState';
import { chromeExtensionIdState } from '@/client-config/states/chromeExtensionIdState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isAnalyticsEnabledState } from '@/client-config/states/isAnalyticsEnabledState';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { isConfigVariablesInDbEnabledState } from '@/client-config/states/isConfigVariablesInDbEnabledState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { isDeveloperDefaultSignInPrefilledState } from '@/client-config/states/isDeveloperDefaultSignInPrefilledState';
import { isEmailVerificationRequiredState } from '@/client-config/states/isEmailVerificationRequiredState';
import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { labPublicFeatureFlagsState } from '@/client-config/states/labPublicFeatureFlagsState';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { getClientConfigFromWindow } from '@/client-config/utils/getClientConfigFromWindow';
import { isClientConfigAvailableFromWindow } from '@/client-config/utils/isClientConfigAvailableFromWindow';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useCallback, useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { ClientConfig, useGetClientConfigQuery } from '~/generated/graphql';

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

  const setCaptcha = useSetRecoilState(captchaState);

  const setChromeExtensionId = useSetRecoilState(chromeExtensionIdState);

  const setApiConfig = useSetRecoilState(apiConfigState);

  const setCanManageFeatureFlags = useSetRecoilState(
    canManageFeatureFlagsState,
  );

  const setLabPublicFeatureFlags = useSetRecoilState(
    labPublicFeatureFlagsState,
  );

  const setMicrosoftMessagingEnabled = useSetRecoilState(
    isMicrosoftMessagingEnabledState,
  );

  const setMicrosoftCalendarEnabled = useSetRecoilState(
    isMicrosoftCalendarEnabledState,
  );

  const setGoogleMessagingEnabled = useSetRecoilState(
    isGoogleMessagingEnabledState,
  );

  const setGoogleCalendarEnabled = useSetRecoilState(
    isGoogleCalendarEnabledState,
  );

  const setIsAttachmentPreviewEnabled = useSetRecoilState(
    isAttachmentPreviewEnabledState,
  );

  const setIsConfigVariablesInDbEnabled = useSetRecoilState(
    isConfigVariablesInDbEnabledState,
  );

  // Check if client config is available from window object (for S3 deployments)
  const isWindowConfigAvailable = isClientConfigAvailableFromWindow();

  // Use GraphQL query as fallback for self-hosters or when window config is not available
  const { data, loading, error } = useGetClientConfigQuery({
    skip: clientConfigApiStatus.isLoaded || isWindowConfigAvailable,
  });

  // Function to set all recoil states from client config data
  const setClientConfigStates = useCallback(
    (clientConfig: ClientConfig) => {
      setAuthProviders({
        google: clientConfig.authProviders.google,
        microsoft: clientConfig.authProviders.microsoft,
        password: clientConfig.authProviders.password,
        sso: clientConfig.authProviders.sso,
      });
      setIsDebugMode(clientConfig.debugMode);
      setIsAnalyticsEnabled(clientConfig.analyticsEnabled);
      setIsDeveloperDefaultSignInPrefilled(clientConfig.signInPrefilled);
      setIsMultiWorkspaceEnabled(clientConfig.isMultiWorkspaceEnabled);
      setIsEmailVerificationRequired(clientConfig.isEmailVerificationRequired);
      setBilling(clientConfig.billing);
      setSupportChat(clientConfig.support);

      setSentryConfig({
        dsn: clientConfig?.sentry?.dsn,
        release: clientConfig?.sentry?.release,
        environment: clientConfig?.sentry?.environment,
      });

      setCaptcha({
        provider: clientConfig?.captcha?.provider,
        siteKey: clientConfig?.captcha?.siteKey,
      });

      setChromeExtensionId(clientConfig?.chromeExtensionId);
      setApiConfig(clientConfig?.api);
      setDomainConfiguration({
        defaultSubdomain: clientConfig?.defaultSubdomain,
        frontDomain: clientConfig?.frontDomain,
      });
      setCanManageFeatureFlags(clientConfig?.canManageFeatureFlags);
      setLabPublicFeatureFlags(clientConfig?.publicFeatureFlags);
      setMicrosoftMessagingEnabled(clientConfig?.isMicrosoftMessagingEnabled);
      setMicrosoftCalendarEnabled(clientConfig?.isMicrosoftCalendarEnabled);
      setGoogleMessagingEnabled(clientConfig?.isGoogleMessagingEnabled);
      setGoogleCalendarEnabled(clientConfig?.isGoogleCalendarEnabled);
      setIsAttachmentPreviewEnabled(clientConfig?.isAttachmentPreviewEnabled);
      setIsConfigVariablesInDbEnabled(
        clientConfig?.isConfigVariablesInDbEnabled,
      );
    },
    [
      setAuthProviders,
      setIsDebugMode,
      setIsAnalyticsEnabled,
      setIsDeveloperDefaultSignInPrefilled,
      setIsMultiWorkspaceEnabled,
      setIsEmailVerificationRequired,
      setBilling,
      setSupportChat,
      setSentryConfig,
      setCaptcha,
      setChromeExtensionId,
      setApiConfig,
      setDomainConfiguration,
      setCanManageFeatureFlags,
      setLabPublicFeatureFlags,
      setMicrosoftMessagingEnabled,
      setMicrosoftCalendarEnabled,
      setGoogleMessagingEnabled,
      setGoogleCalendarEnabled,
      setIsAttachmentPreviewEnabled,
      setIsConfigVariablesInDbEnabled,
    ],
  );

  useEffect(() => {
    // First, try to get config from window object (primarily for S3-hosted frontends)
    if (isWindowConfigAvailable) {
      const windowClientConfig = getClientConfigFromWindow();
      if (isDefined(windowClientConfig)) {
        setClientConfigApiStatus({
          isLoaded: true,
          isErrored: false,
          error: undefined,
        });
        setClientConfigStates(windowClientConfig);
        return;
      }
    }

    // Fallback to GraphQL approach (for self-hosters and when window config fails)
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

    setClientConfigStates(data.clientConfig);
  }, [
    isWindowConfigAvailable,
    data,
    loading,
    error,
    setClientConfigApiStatus,
    setClientConfigStates,
  ]);

  return <></>;
};
