import { AppChip } from '@/applications/components/AppChip';
import { CurrentApplicationContext } from '@/applications/contexts/CurrentApplicationContext';
import { useRefetchOnApplicationOperation } from '@/applications/hooks/useRefetchOnApplicationOperation';
import { useResolvedApplicationDescription } from '@/applications/hooks/useResolvedApplicationDescription';
import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useUpgradeApplication } from '@/marketplace/hooks/useUpgradeApplication';
import { useInstalledBuiltInAccountApp } from '@/settings/applications/hooks/useInstalledBuiltInAccountApp';
import { useUninstallApplication } from '@/settings/applications/hooks/useUninstallApplication';
import { getDisplayedApplicationVariables } from '@/settings/applications/utils/getDisplayedApplicationVariables';
import { getSettingsMenuItemsForScope } from '@/settings/applications/utils/getSettingsMenuItemsForScope';
import { APPLICATION_VARIABLES_TAB_ID } from '@/settings/applications/constants/ApplicationVariablesTabId';
import { getApplicationConfigurationTabId } from '@/settings/applications/utils/getApplicationConfigurationTabId';
import { hasApplicationVariablesTab } from '@/settings/applications/utils/hasApplicationVariablesTab';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import type { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation, useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import {
  IconAlertTriangle,
  IconApps,
  IconDeviceFloppy,
  IconSettings,
  IconVariable,
  useIcons,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import {
  ApplicationRegistrationSourceType,
  ApplicationVariableScope,
  FindMarketplaceAppDetailDocument,
  FindOneApplicationDocument,
  IsApplicationStoppedDocument,
  SettingsMenuItemScope,
  UpdateOneApplicationVariableDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsApplicationHealthBanner } from '~/pages/settings/applications/components/SettingsApplicationHealthBanner';
import { SettingsApplicationMissingConfigurationBanner } from '@/settings/applications/components/SettingsApplicationMissingConfigurationBanner';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsApplicationNotFound } from '~/pages/settings/applications/components/SettingsApplicationNotFound';
import { SettingsBuiltInAccountAppDetails } from '~/pages/settings/applications/SettingsBuiltInAccountAppDetails';
import { CUSTOM_APPLICATION_ILLUSTRATIONS } from '~/pages/settings/applications/constants/CustomApplicationIllustrations';
import { STANDARD_APPLICATION_ILLUSTRATIONS } from '~/pages/settings/applications/constants/StandardApplicationIllustrations';
import { useApplicationHealthCheck } from '~/pages/settings/applications/hooks/useApplicationHealthCheck';
import { useApplicationVariablesDraft } from '@/settings/applications/hooks/useApplicationVariablesDraft';
import { SettingsApplicationCustomSettingsSection } from '@/settings/applications/components/SettingsApplicationCustomSettingsSection';
import { SettingsApplicationDetailGeneralTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailGeneralTab';
import { SettingsApplicationDetailVariablesTab } from '@/settings/applications/components/SettingsApplicationDetailVariablesTab';
import { getApplicationDescriptionSummary } from '~/pages/settings/applications/utils/getApplicationDescriptionSummary';
import { getApplicationHealthBanner } from '~/pages/settings/applications/utils/getApplicationHealthBanner';
import { getApplicationLookupStatus } from '~/pages/settings/applications/utils/getApplicationLookupStatus';
import { hasApplicationUpdate } from '~/pages/settings/applications/utils/hasApplicationUpdate';
import { isUuidFormat } from '~/pages/settings/applications/utils/isUuidFormat';
import { getMissingRequiredApplicationVariables } from '@/settings/applications/utils/getMissingRequiredApplicationVariables';
import { getSettingsMenuItemDisplayTitle } from '~/pages/settings/applications/utils/getSettingsMenuItemDisplayTitle';

const APPLICATION_DETAIL_ID = 'application-detail-id';

const GENERAL_TAB_ID = 'general';

export const SettingsApplicationDetails = () => {
  const { applicationId = '' } = useParams<{ applicationId: string }>();
  const { getIcon } = useIcons();
  const builtInAccountApp = useInstalledBuiltInAccountApp(applicationId);

  const {
    data,
    error: applicationError,
    loading: isApplicationLoading,
    refetch,
  } = useQuery(FindOneApplicationDocument, {
    variables: { id: applicationId },
    skip: !isUuidFormat(applicationId),
  });

  useRefetchOnApplicationOperation({ applicationId, refetch });

  const application = data?.findOneApplication;

  const applicationLookupStatus = getApplicationLookupStatus({
    identifier: applicationId,
    isLoading: isApplicationLoading,
    error: applicationError,
    result: application,
  });
  const isNotFound = applicationLookupStatus === 'not-found';
  const isUnavailable = applicationLookupStatus === 'unavailable';

  const { data: detailData } = useQuery(FindMarketplaceAppDetailDocument, {
    variables: { universalIdentifier: application?.universalIdentifier ?? '' },
    skip: !application?.universalIdentifier,
  });

  const { data: isApplicationStoppedData } = useQuery(
    IsApplicationStoppedDocument,
    {
      variables: {
        applicationUniversalIdentifier: application?.universalIdentifier ?? '',
      },
      skip: !application?.universalIdentifier,
      // The kill switch is toggled server-side, a cached value would hide it.
      fetchPolicy: 'network-only',
    },
  );

  const isApplicationStopped =
    isApplicationStoppedData?.isApplicationStopped === true;

  const detail = detailData?.findMarketplaceAppDetail;

  const isMarketplaceApplication =
    detail?.sourceType === ApplicationRegistrationSourceType.NPM;

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const isStandardApplication = isTwentyStandardApplication(application);
  const isCustomApplication = isWorkspaceCustomApplication(
    application,
    currentWorkspace,
  );

  const resolvedDescription = useResolvedApplicationDescription(application);

  const displayName =
    detail?.name ?? application?.name ?? t`Application details`;
  const description = detail?.description ?? resolvedDescription;

  const getCoverImageUrl = () => {
    if (detail?.galleryImages?.length) return detail.galleryImages[0];
    if (isStandardApplication) return STANDARD_APPLICATION_ILLUSTRATIONS[0];
    if (isCustomApplication) return CUSTOM_APPLICATION_ILLUSTRATIONS[0];
    return undefined;
  };

  const handleUpgradeCompleted = useCallback(() => {
    void refetch();
  }, [refetch]);
  const { upgrade, isUpgrading, upgradeProgress } = useUpgradeApplication({
    universalIdentifier: application?.universalIdentifier,
    onCompleted: handleUpgradeCompleted,
  });

  const sourceType = application?.applicationRegistration?.sourceType;
  const currentVersion = application?.version;
  const latestAvailableVersion =
    detail?.latestAvailableVersion ??
    application?.applicationRegistration?.latestAvailableVersion;

  const hasUpdate = hasApplicationUpdate({
    sourceType,
    currentVersion,
    latestAvailableVersion,
  });

  const handleUpgrade = async () => {
    if (!isDefined(latestAvailableVersion)) {
      return;
    }

    await upgrade(latestAvailableVersion);
  };

  const navigate = useNavigateSettings();
  const redirect = useNavigate();
  const handleUninstallCompleted = useCallback(() => {
    navigate(SettingsPath.Applications);
  }, [navigate]);
  const { uninstall, isUninstalling, uninstallProgress } =
    useUninstallApplication({
      universalIdentifier: application?.universalIdentifier,
      onCompleted: handleUninstallCompleted,
    });

  const displayedApplicationVariables = getDisplayedApplicationVariables(
    (application?.applicationVariables ?? []).filter(
      (applicationVariable) =>
        applicationVariable.scope === ApplicationVariableScope.WORKSPACE,
    ),
  );

  const [updateOneApplicationVariable] = useMutation(
    UpdateOneApplicationVariableDocument,
  );

  const {
    draftApplicationVariables,
    setApplicationVariableValue,
    clearApplicationVariableValue,
    hasUnsavedApplicationVariables,
    saveApplicationVariables,
    isSavingApplicationVariables,
  } = useApplicationVariablesDraft({
    applicationId,
    scope: ApplicationVariableScope.WORKSPACE,
    applicationVariables: displayedApplicationVariables,
    updateApplicationVariable: ({ key, value }) =>
      updateOneApplicationVariable({
        variables: { key, value, applicationId },
      }),
    refetchApplicationVariables: refetch,
  });

  const workspaceSettingsMenuItems = getSettingsMenuItemsForScope({
    settingsMenuItems: application?.settingsMenuItems ?? [],
    scope: SettingsMenuItemScope.WORKSPACE,
  });

  const missingRequiredApplicationVariables =
    getMissingRequiredApplicationVariables(displayedApplicationVariables);

  const hasVariablesTab = hasApplicationVariablesTab({
    settingsMenuItems: workspaceSettingsMenuItems,
    displayedApplicationVariables,
  });

  const { healthCheckResult, runHealthCheck } = useApplicationHealthCheck({
    applicationId,
    healthCheckLogicFunctionId: application?.healthCheckLogicFunctionId,
  });

  const saveApplicationVariablesAndRecheckHealth = async () => {
    await saveApplicationVariables();
    await runHealthCheck();
  };

  const tabs: SingleTabProps[] = [
    { id: GENERAL_TAB_ID, title: t`General`, Icon: IconSettings },
    ...(hasVariablesTab
      ? [
          {
            id: APPLICATION_VARIABLES_TAB_ID,
            title: t`Variables`,
            Icon: IconVariable,
          },
        ]
      : []),
    ...workspaceSettingsMenuItems.map((settingsMenuItem) => ({
      id: settingsMenuItem.universalIdentifier,
      title: getSettingsMenuItemDisplayTitle({
        applicationUniversalIdentifier: application?.universalIdentifier ?? '',
        frontComponents: application?.frontComponents ?? [],
        settingsMenuItem,
      }),
      Icon: getIcon(settingsMenuItem.icon, 'IconAdjustments'),
    })),
  ];

  const activeTabId = useSettingsActiveTabId(
    APPLICATION_DETAIL_ID,
    tabs.map((tab) => tab.id),
  );

  const configurationTabId = getApplicationConfigurationTabId({
    hasVariablesTab,
    settingsMenuItems: workspaceSettingsMenuItems,
  });

  const configurationTabLocation = isDefined(configurationTabId)
    ? getSettingsPath(
        SettingsPath.ApplicationDetail,
        { applicationId },
        undefined,
        configurationTabId,
      )
    : undefined;

  const goToConfigurationTab = isDefined(configurationTabLocation)
    ? () => redirect(configurationTabLocation)
    : undefined;

  const healthBanner = isNonEmptyArray(missingRequiredApplicationVariables)
    ? undefined
    : getApplicationHealthBanner({
        healthCheckResult,
        fallbackLocation: configurationTabLocation,
      });

  const healthBannerAction = healthBanner?.action;
  const healthBannerButton = isDefined(healthBannerAction)
    ? {
        label: healthBannerAction.label,
        onClick: () => redirect(healthBannerAction.to),
      }
    : undefined;

  const renderActiveTabContent = () => {
    if (isUnavailable) {
      return (
        <SettingsApplicationLoadErrorBanner
          onRetry={() => refetch().catch(() => undefined)}
        />
      );
    }

    if (isNotFound) {
      return (
        <SettingsApplicationNotFound
          message={t`This application is not installed on this workspace. It may have been uninstalled or the link is incorrect.`}
          linkTo={getSettingsPath(
            SettingsPath.Applications,
            undefined,
            undefined,
            'installed',
          )}
          linkLabel={t`See installed applications`}
          LinkIcon={IconApps}
        />
      );
    }

    if (!isDefined(application)) {
      return <SettingsSectionSkeletonLoader />;
    }

    switch (activeTabId) {
      case GENERAL_TAB_ID:
        return (
          <SettingsApplicationDetailGeneralTab
            application={application}
            displayName={displayName}
            description={getApplicationDescriptionSummary(description)}
            coverImageUrl={getCoverImageUrl()}
            marketplaceUniversalIdentifier={detail?.universalIdentifier}
            isMarketplaceApplication={isMarketplaceApplication}
            hasUpdate={hasUpdate}
            latestAvailableVersion={latestAvailableVersion ?? undefined}
            onUpgrade={handleUpgrade}
            isUpgrading={isUpgrading}
            upgradeProgress={upgradeProgress}
            onUninstall={uninstall}
            isUninstalling={isUninstalling}
            uninstallProgress={uninstallProgress}
          />
        );
      case APPLICATION_VARIABLES_TAB_ID:
        return (
          <SettingsApplicationDetailVariablesTab
            applicationVariables={draftApplicationVariables}
            onVariableChange={setApplicationVariableValue}
            onVariableClear={clearApplicationVariableValue}
          />
        );
      default: {
        const activeSettingsMenuItem = workspaceSettingsMenuItems.find(
          (settingsMenuItem) =>
            settingsMenuItem.universalIdentifier === activeTabId,
        );

        if (!isDefined(activeSettingsMenuItem)) {
          return <></>;
        }

        return (
          <SettingsApplicationCustomSettingsSection
            frontComponentId={activeSettingsMenuItem.frontComponentId}
          />
        );
      }
    }
  };

  if (isDefined(builtInAccountApp)) {
    return (
      <SettingsBuiltInAccountAppDetails builtInAccountApp={builtInAccountApp} />
    );
  }

  return (
    <CurrentApplicationContext.Provider value={application?.id ?? null}>
      <SettingsPageLayout
        title={displayName}
        icon={
          isDefined(application) ? (
            <AppChip
              applicationId={application.id}
              logoUrl={application.logoUrl}
              fallbackApplicationData={{
                name: displayName,
              }}
              size="md"
              chipOnly
            />
          ) : undefined
        }
        links={[
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.General),
          },
          {
            children: t`Apps`,
            href: getSettingsPath(SettingsPath.Applications),
          },
          { children: displayName },
        ]}
        actionButton={
          activeTabId === APPLICATION_VARIABLES_TAB_ID ? (
            <Button
              startIcon={<IconDeviceFloppy />}
              variant="solid"
              color="accent"
              size="sm"
              onClick={saveApplicationVariablesAndRecheckHealth}
              disabled={
                !hasUnsavedApplicationVariables || isSavingApplicationVariables
              }
            >{t`Save settings`}</Button>
          ) : undefined
        }
        secondaryBar={
          isNotFound || isUnavailable || tabs.length <= 1 ? undefined : (
            <SettingsTabBar
              aria-label={t`Application details`}
              tabs={tabs}
              componentInstanceId={APPLICATION_DETAIL_ID}
            />
          )
        }
      >
        <SettingsPageContainer overflow="visible">
          {isNonEmptyArray(missingRequiredApplicationVariables) &&
            isDefined(goToConfigurationTab) && (
              <SettingsApplicationMissingConfigurationBanner
                missingApplicationVariables={
                  missingRequiredApplicationVariables
                }
                onConfigure={goToConfigurationTab}
              />
            )}
          {isDefined(healthBanner) && (
            <SettingsApplicationHealthBanner
              healthStatus={healthBanner.status}
              title={healthBanner.title}
              description={healthBanner.description}
              action={healthBannerButton}
            />
          )}
          {isApplicationStopped && (
            <InlineBanner
              status="warning"
              icon={<IconAlertTriangle aria-hidden="true" />}
            >{t`We are currently encountering issues with this app, its behavior may be degraded while we work on a fix.`}</InlineBanner>
          )}
          {renderActiveTabContent()}
        </SettingsPageContainer>
      </SettingsPageLayout>
    </CurrentApplicationContext.Provider>
  );
};
