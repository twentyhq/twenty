import { aiModelsState } from '@/client-config/states/aiModelsState';
import { apiConfigState } from '@/client-config/states/apiConfigState';
import { appVersionState } from '@/client-config/states/appVersionState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { billingState } from '@/client-config/states/billingState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { canManageFeatureFlagsState } from '@/client-config/states/canManageFeatureFlagsState';
import { captchaState } from '@/client-config/states/captchaState';
import { chromeExtensionIdState } from '@/client-config/states/chromeExtensionIdState';
import { isAnalyticsEnabledState } from '@/client-config/states/isAnalyticsEnabledState';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { isConfigVariablesInDbEnabledState } from '@/client-config/states/isConfigVariablesInDbEnabledState';
import { isDeveloperDefaultSignInPrefilledState } from '@/client-config/states/isDeveloperDefaultSignInPrefilledState';
import { isEmailingDomainsEnabledState } from '@/client-config/states/isEmailingDomainsEnabledState';
import { isEmailVerificationRequiredState } from '@/client-config/states/isEmailVerificationRequiredState';
import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isImapSmtpCaldavEnabledState } from '@/client-config/states/isImapSmtpCaldavEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { labPublicFeatureFlagsState } from '@/client-config/states/labPublicFeatureFlagsState';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { type ClientConfig } from '@/client-config/types/ClientConfig';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { getClientConfig } from '@/client-config/utils/getClientConfig';

type UseClientConfigResult = {
  data: { clientConfig: ClientConfig } | undefined;
  loading: boolean;
  error: Error | undefined;
  fetchClientConfig: () => Promise<void>;
  refetch: () => Promise<void>;
};

export const useClientConfig = (): UseClientConfigResult => {
  const setIsAnalyticsEnabled = useSetRecoilState(isAnalyticsEnabledState);
  const setDomainConfiguration = useSetRecoilState(domainConfigurationState);
  const setAuthProviders = useSetRecoilState(authProvidersState);
  const setAiModels = useSetRecoilState(aiModelsState);

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

  const setCalendarBookingPageId = useSetRecoilState(
    calendarBookingPageIdState,
  );

  const setIsImapSmtpCaldavEnabled = useSetRecoilState(
    isImapSmtpCaldavEnabledState,
  );
  const setIsEmailingDomainsEnabled = useSetRecoilState(
    isEmailingDomainsEnabledState,
  );

  const setAppVersion = useSetRecoilState(appVersionState);

  const fetchClientConfig = useCallback(async () => {
    setClientConfigApiStatus((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      const clientConfig = await getClientConfig();
      setClientConfigApiStatus((prev) => ({
        ...prev,
        isLoading: false,
        isLoadedOnce: true,
        isErrored: false,
        error: undefined,
        data: { clientConfig },
      }));
      setClientConfigApiStatus((currentStatus) => ({
        ...currentStatus,
        isErrored: false,
        error: undefined,
      }));
      setAppVersion(clientConfig.appVersion);
      setAuthProviders({
        google: clientConfig.authProviders.google,
        microsoft: clientConfig.authProviders.microsoft,
        password: clientConfig.authProviders.password,
        magicLink: false,
        sso: clientConfig.authProviders.sso,
      });
      setAiModels(clientConfig.aiModels || []);
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
      setClientConfigApiStatus((currentStatus) => ({
        ...currentStatus,
        isSaved: true,
      }));

      setCalendarBookingPageId(clientConfig?.calendarBookingPageId ?? null);
      setIsImapSmtpCaldavEnabled(clientConfig?.isImapSmtpCaldavEnabled);
      setIsEmailingDomainsEnabled(clientConfig?.isEmailingDomainsEnabled);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch client config');
      setClientConfigApiStatus((prev) => ({
        ...prev,
        isLoading: false,
        isLoadedOnce: true,
        isErrored: true,
        error,
      }));
    }
  }, [
    setAiModels,
    setApiConfig,
    setAppVersion,
    setAuthProviders,
    setBilling,
    setCalendarBookingPageId,
    setCanManageFeatureFlags,
    setCaptcha,
    setChromeExtensionId,
    setClientConfigApiStatus,
    setDomainConfiguration,
    setGoogleCalendarEnabled,
    setGoogleMessagingEnabled,
    setIsAnalyticsEnabled,
    setIsAttachmentPreviewEnabled,
    setIsConfigVariablesInDbEnabled,
    setIsDeveloperDefaultSignInPrefilled,
    setIsEmailVerificationRequired,
    setIsImapSmtpCaldavEnabled,
    setIsMultiWorkspaceEnabled,
    setIsEmailingDomainsEnabled,
    setLabPublicFeatureFlags,
    setMicrosoftCalendarEnabled,
    setMicrosoftMessagingEnabled,
    setSentryConfig,
    setSupportChat,
  ]);

  return {
    data: clientConfigApiStatus.data,
    loading: clientConfigApiStatus.isLoading || false,
    error: clientConfigApiStatus.error,
    fetchClientConfig,
    refetch: fetchClientConfig,
  };
};
