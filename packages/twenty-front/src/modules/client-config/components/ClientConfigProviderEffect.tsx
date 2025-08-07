import { useClientConfig } from '@/client-config/hooks/useClientConfig';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { apiConfigState } from '@/client-config/states/apiConfigState';
import { appVersionState } from '@/client-config/states/appVersionState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { billingState } from '@/client-config/states/billingState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { canManageFeatureFlagsState } from '@/client-config/states/canManageFeatureFlagsState';
import { captchaState } from '@/client-config/states/captchaState';
import { chromeExtensionIdState } from '@/client-config/states/chromeExtensionIdState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isAnalyticsEnabledState } from '@/client-config/states/isAnalyticsEnabledState';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { isConfigVariablesInDbEnabledState } from '@/client-config/states/isConfigVariablesInDbEnabledState';
import { isDeveloperDefaultSignInPrefilledState } from '@/client-config/states/isDeveloperDefaultSignInPrefilledState';
import { isEmailVerificationRequiredState } from '@/client-config/states/isEmailVerificationRequiredState';
import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isImapSmtpCaldavEnabledState } from '@/client-config/states/isImapSmtpCaldavEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { isWorkspaceCreationLimitedToAdminsState } from '@/client-config/states/isWorkspaceCreationLimitedToAdminsState';
import { labPublicFeatureFlagsState } from '@/client-config/states/labPublicFeatureFlagsState';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { supportChatState } from '@/client-config/states/supportChatState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const ClientConfigProviderEffect = () => {
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
  const setIsWorkspaceCreationLimitedToAdmins = useSetRecoilState(
    isWorkspaceCreationLimitedToAdminsState,
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

  const setAppVersion = useSetRecoilState(appVersionState);

  const { data, loading, error, fetchClientConfig } = useClientConfig();

  useEffect(() => {
    if (
      !clientConfigApiStatus.isLoadedOnce &&
      !clientConfigApiStatus.isLoading
    ) {
      fetchClientConfig();
    }
  }, [
    clientConfigApiStatus.isLoadedOnce,
    clientConfigApiStatus.isLoading,
    fetchClientConfig,
  ]);

  useEffect(() => {
    if (loading) return;

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
    setAppVersion(data.clientConfig.appVersion);
    setAuthProviders({
      google: data?.clientConfig.authProviders.google,
      microsoft: data?.clientConfig.authProviders.microsoft,
      password: data?.clientConfig.authProviders.password,
      magicLink: false,
      sso: data?.clientConfig.authProviders.sso,
    });
    setAiModels(data?.clientConfig.aiModels || []);
    setIsAnalyticsEnabled(data?.clientConfig.analyticsEnabled);
    setIsDeveloperDefaultSignInPrefilled(data?.clientConfig.signInPrefilled);
    setIsMultiWorkspaceEnabled(data?.clientConfig.isMultiWorkspaceEnabled);
    setIsWorkspaceCreationLimitedToAdmins(
      data?.clientConfig.isWorkspaceCreationLimitedToAdmins,
    );
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

    setCaptcha({
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
    setLabPublicFeatureFlags(data?.clientConfig?.publicFeatureFlags);
    setMicrosoftMessagingEnabled(
      data?.clientConfig?.isMicrosoftMessagingEnabled,
    );
    setMicrosoftCalendarEnabled(data?.clientConfig?.isMicrosoftCalendarEnabled);
    setGoogleMessagingEnabled(data?.clientConfig?.isGoogleMessagingEnabled);
    setGoogleCalendarEnabled(data?.clientConfig?.isGoogleCalendarEnabled);
    setIsAttachmentPreviewEnabled(
      data?.clientConfig?.isAttachmentPreviewEnabled,
    );
    setIsConfigVariablesInDbEnabled(
      data?.clientConfig?.isConfigVariablesInDbEnabled,
    );
    setClientConfigApiStatus((currentStatus) => ({
      ...currentStatus,
      isSaved: true,
    }));

    setCalendarBookingPageId(data?.clientConfig?.calendarBookingPageId ?? null);
    setIsImapSmtpCaldavEnabled(data?.clientConfig?.isImapSmtpCaldavEnabled);
  }, [
    data,
    loading,
    error,
    setIsDeveloperDefaultSignInPrefilled,
    setIsMultiWorkspaceEnabled,
    setIsEmailVerificationRequired,
    setSupportChat,
    setBilling,
    setSentryConfig,
    setClientConfigApiStatus,
    setCaptcha,
    setChromeExtensionId,
    setApiConfig,
    setIsAnalyticsEnabled,
    setDomainConfiguration,
    setAuthProviders,
    setAiModels,
    setCanManageFeatureFlags,
    setLabPublicFeatureFlags,
    setMicrosoftMessagingEnabled,
    setMicrosoftCalendarEnabled,
    setGoogleMessagingEnabled,
    setGoogleCalendarEnabled,
    setIsAttachmentPreviewEnabled,
    setIsConfigVariablesInDbEnabled,
    setCalendarBookingPageId,
    setIsImapSmtpCaldavEnabled,
    setAppVersion,
  ]);

  return <></>;
};
