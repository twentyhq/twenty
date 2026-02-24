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
import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { isCloudflareIntegrationEnabledState } from '@/client-config/states/isCloudflareIntegrationEnabledState';
import { isEmailingDomainsEnabledState } from '@/client-config/states/isEmailingDomainsEnabledState';
import { isEmailVerificationRequiredState } from '@/client-config/states/isEmailVerificationRequiredState';
import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isImapSmtpCaldavEnabledState } from '@/client-config/states/isImapSmtpCaldavEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { labPublicFeatureFlagsStateV2 } from '@/client-config/states/labPublicFeatureFlagsStateV2';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { type ClientConfig } from '@/client-config/types/ClientConfig';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useCallback } from 'react';
import { isAttachmentPreviewEnabledStateV2 } from '@/client-config/states/isAttachmentPreviewEnabledStateV2';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { getClientConfig } from '@/client-config/utils/getClientConfig';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { useStore } from 'jotai';

type UseClientConfigResult = {
  data: { clientConfig: ClientConfig } | undefined;
  loading: boolean;
  error: Error | undefined;
  fetchClientConfig: () => Promise<void>;
  refetch: () => Promise<void>;
};

export const useClientConfig = (): UseClientConfigResult => {
  const store = useStore();
  const setIsAnalyticsEnabled = useSetRecoilStateV2(isAnalyticsEnabledState);
  const setDomainConfiguration = useSetRecoilStateV2(domainConfigurationState);
  const setAuthProviders = useSetRecoilStateV2(authProvidersState);
  const setAiModels = useSetRecoilStateV2(aiModelsState);

  const setIsDeveloperDefaultSignInPrefilled = useSetRecoilStateV2(
    isDeveloperDefaultSignInPrefilledState,
  );
  const setIsMultiWorkspaceEnabled = useSetRecoilStateV2(
    isMultiWorkspaceEnabledState,
  );
  const setIsEmailVerificationRequired = useSetRecoilStateV2(
    isEmailVerificationRequiredState,
  );

  const setBilling = useSetRecoilStateV2(billingState);
  const setSupportChat = useSetRecoilStateV2(supportChatState);

  const setSentryConfig = useSetRecoilStateV2(sentryConfigState);
  const [clientConfigApiStatus, setClientConfigApiStatus] = useRecoilStateV2(
    clientConfigApiStatusState,
  );

  const setCaptcha = useSetRecoilStateV2(captchaState);

  const setChromeExtensionId = useSetRecoilStateV2(chromeExtensionIdState);

  const setApiConfig = useSetRecoilStateV2(apiConfigState);

  const setCanManageFeatureFlags = useSetRecoilStateV2(
    canManageFeatureFlagsState,
  );

  const setLabPublicFeatureFlags = useSetRecoilStateV2(
    labPublicFeatureFlagsStateV2,
  );

  const setMicrosoftMessagingEnabled = useSetRecoilStateV2(
    isMicrosoftMessagingEnabledState,
  );

  const setMicrosoftCalendarEnabled = useSetRecoilStateV2(
    isMicrosoftCalendarEnabledState,
  );

  const setGoogleMessagingEnabled = useSetRecoilStateV2(
    isGoogleMessagingEnabledState,
  );

  const setGoogleCalendarEnabled = useSetRecoilStateV2(
    isGoogleCalendarEnabledState,
  );

  const setIsAttachmentPreviewEnabled = useSetRecoilStateV2(
    isAttachmentPreviewEnabledState,
  );

  const setIsConfigVariablesInDbEnabled = useSetRecoilStateV2(
    isConfigVariablesInDbEnabledState,
  );

  const setCalendarBookingPageId = useSetRecoilStateV2(
    calendarBookingPageIdState,
  );

  const setIsImapSmtpCaldavEnabled = useSetRecoilStateV2(
    isImapSmtpCaldavEnabledState,
  );
  const setIsEmailingDomainsEnabled = useSetRecoilStateV2(
    isEmailingDomainsEnabledState,
  );

  const setAllowRequestsToTwentyIcons = useSetRecoilStateV2(
    allowRequestsToTwentyIconsState,
  );

  const setIsCloudflareIntegrationEnabled = useSetRecoilStateV2(
    isCloudflareIntegrationEnabledState,
  );

  const setIsClickHouseConfigured = useSetRecoilStateV2(
    isClickHouseConfiguredState,
  );

  const setAppVersion = useSetRecoilStateV2(appVersionState);

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
      store.set(
        isAttachmentPreviewEnabledStateV2.atom,
        clientConfig?.isAttachmentPreviewEnabled,
      );
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
      setAllowRequestsToTwentyIcons(clientConfig?.allowRequestsToTwentyIcons);
      setIsCloudflareIntegrationEnabled(
        clientConfig?.isCloudflareIntegrationEnabled,
      );
      setIsClickHouseConfigured(clientConfig?.isClickHouseConfigured ?? false);
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
    setIsClickHouseConfigured,
    setIsCloudflareIntegrationEnabled,
    setLabPublicFeatureFlags,
    setMicrosoftCalendarEnabled,
    setMicrosoftMessagingEnabled,
    setSentryConfig,
    setSupportChat,
    setAllowRequestsToTwentyIcons,
    store,
  ]);

  return {
    data: clientConfigApiStatus.data,
    loading: clientConfigApiStatus.isLoading || false,
    error: clientConfigApiStatus.error,
    fetchClientConfig,
    refetch: fetchClientConfig,
  };
};
