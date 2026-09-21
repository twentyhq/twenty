import { AppChip } from '@/applications/components/AppChip';
import { CurrentApplicationContext } from '@/applications/contexts/CurrentApplicationContext';
import { useRefetchOnApplicationOperation } from '@/applications/hooks/useRefetchOnApplicationOperation';
import { useResolvedApplicationDescription } from '@/applications/hooks/useResolvedApplicationDescription';
import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useUpgradeApplication } from '@/marketplace/hooks/useUpgradeApplication';
import { useUninstallApplication } from '@/settings/applications/hooks/useUninstallApplication';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import type { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import {
  IconAlertTriangle,
  IconAdjustments,
  IconDeviceFloppy,
  IconSettings,
  IconVariable,
} from 'twenty-ui/icon';
import { InlineBanner } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import {
  FindMarketplaceAppDetailDocument,
  FindOneApplicationDocument,
  IsApplicationStoppedDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { CUSTOM_APPLICATION_ILLUSTRATIONS } from '~/pages/settings/applications/constants/CustomApplicationIllustrations';
import { STANDARD_APPLICATION_ILLUSTRATIONS } from '~/pages/settings/applications/constants/StandardApplicationIllustrations';
import { useApplicationHealthCheck } from '~/pages/settings/applications/hooks/useApplicationHealthCheck';
import { useApplicationVariablesDraft } from '~/pages/settings/applications/hooks/useApplicationVariablesDraft';
import { SettingsApplicationHealthBanner } from '~/pages/settings/applications/components/SettingsApplicationHealthBanner';
import { SettingsApplicationMissingConfigurationBanner } from '~/pages/settings/applications/components/SettingsApplicationMissingConfigurationBanner';
import { SettingsApplicationCustomSettingsSection } from '~/pages/settings/applications/tabs/SettingsApplicationCustomSettingsSection';
import { SettingsApplicationDetailGeneralTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailGeneralTab';
import { SettingsApplicationDetailVariablesTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailVariablesTab';
import { getApplicationDescriptionSummary } from '~/pages/settings/applications/utils/getApplicationDescriptionSummary';
import { getDisplayedApplicationVariables } from '~/pages/settings/applications/utils/getDisplayedApplicationVariables';
import { getMissingRequiredApplicationVariables } from '~/pages/settings/applications/utils/getMissingRequiredApplicationVariables';
import { isNewerSemver } from '~/pages/settings/applications/utils/isNewerSemver';
import { isUpgradableApplicationSourceType } from '~/pages/settings/applications/utils/isUpgradableApplicationSourceType';

const APPLICATION_DETAIL_ID = 'application-detail-id';

const GENERAL_TAB_ID = 'general';
const VARIABLES_TAB_ID = 'variables';
const CUSTOM_SETTINGS_TAB_ID = 'settings';

export const SettingsApplicationDetails = () => {
  const { applicationId = '' } = useParams<{ applicationId: string }>();

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    APPLICATION_DETAIL_ID,
  );

  const setActiveTabId = useSetAtomComponentState(
    activeTabIdComponentState,
    APPLICATION_DETAIL_ID,
  );

  const { data, refetch } = useQuery(FindOneApplicationDocument, {
    variables: { id: applicationId },
    skip: !applicationId,
  });

  useRefetchOnApplicationOperation({ applicationId, refetch });

  const application = data?.findOneApplication;

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

  const { upgrade, isUpgrading } = useUpgradeApplication();

  const sourceType = application?.applicationRegistration?.sourceType;
  const registrationId = detail?.id ?? application?.applicationRegistration?.id;
  const currentVersion = application?.version;
  const latestAvailableVersion =
    detail?.latestAvailableVersion ??
    application?.applicationRegistration?.latestAvailableVersion;

  const hasUpdate =
    isUpgradableApplicationSourceType(sourceType) &&
    isDefined(latestAvailableVersion) &&
    isDefined(currentVersion) &&
    isNewerSemver(latestAvailableVersion, currentVersion);

  const handleUpgrade = async () => {
    if (!isDefined(registrationId) || !isDefined(latestAvailableVersion)) {
      return;
    }

    await upgrade({
      appRegistrationId: registrationId,
      targetVersion: latestAvailableVersion,
    });
  };

  const navigate = useNavigateSettings();
  const handleUninstallCompleted = useCallback(() => {
    navigate(SettingsPath.Applications);
  }, [navigate]);
  const { uninstall, isUninstalling } = useUninstallApplication({
    universalIdentifier: application?.universalIdentifier,
    onCompleted: handleUninstallCompleted,
  });

  const displayedApplicationVariables = getDisplayedApplicationVariables(
    application?.applicationVariables ?? [],
  );

  const {
    draftApplicationVariables,
    setApplicationVariableValue,
    hasUnsavedApplicationVariables,
    saveApplicationVariables,
    isSavingApplicationVariables,
  } = useApplicationVariablesDraft({
    applicationId,
    applicationVariables: displayedApplicationVariables,
  });

  const settingsFrontComponentId =
    application?.settingsCustomTabFrontComponentId;
  const hasCustomSettingsTab = isDefined(settingsFrontComponentId);

  const missingRequiredApplicationVariables =
    getMissingRequiredApplicationVariables(displayedApplicationVariables);

  const configurationTabId = hasCustomSettingsTab
    ? CUSTOM_SETTINGS_TAB_ID
    : VARIABLES_TAB_ID;

  useApplicationHealthCheck({
    applicationId,
    healthCheckLogicFunctionId: application?.healthCheckLogicFunctionId,
    refetchApplication: refetch,
  });

  const healthStatus = application?.healthStatus;
  const healthMessage = application?.healthMessage;

  const shouldDisplayHealthBanner =
    !isNonEmptyArray(missingRequiredApplicationVariables) &&
    isDefined(healthStatus) &&
    isNonEmptyString(healthMessage);

  const tabs: SingleTabProps[] = [
    { id: GENERAL_TAB_ID, title: t`General`, Icon: IconSettings },
    // A custom settings tab lays out the application variables itself, so
    // exposing them again would duplicate the same fields.
    ...(!hasCustomSettingsTab && displayedApplicationVariables.length > 0
      ? [{ id: VARIABLES_TAB_ID, title: t`Variables`, Icon: IconVariable }]
      : []),
    ...(hasCustomSettingsTab
      ? [
          {
            id: CUSTOM_SETTINGS_TAB_ID,
            title: t`Settings`,
            Icon: IconAdjustments,
          },
        ]
      : []),
  ];

  const renderActiveTabContent = () => {
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
            hasUpdate={hasUpdate}
            latestAvailableVersion={latestAvailableVersion ?? undefined}
            onUpgrade={handleUpgrade}
            isUpgrading={isUpgrading}
            onUninstall={uninstall}
            isUninstalling={isUninstalling}
          />
        );
      case VARIABLES_TAB_ID:
        return (
          <SettingsApplicationDetailVariablesTab
            applicationVariables={draftApplicationVariables}
            onVariableChange={setApplicationVariableValue}
          />
        );
      case CUSTOM_SETTINGS_TAB_ID:
        return hasCustomSettingsTab ? (
          <SettingsApplicationCustomSettingsSection
            frontComponentId={settingsFrontComponentId}
          />
        ) : null;
      default:
        return <></>;
    }
  };

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
          activeTabId === VARIABLES_TAB_ID ? (
            <Button
              startIcon={<IconDeviceFloppy />}
              variant="solid"
              color="accent"
              size="sm"
              onClick={saveApplicationVariables}
              disabled={
                !hasUnsavedApplicationVariables || isSavingApplicationVariables
              }
            >{t`Save settings`}</Button>
          ) : undefined
        }
        secondaryBar={
          <SettingsTabBar
            aria-label={t`Application details`}
            tabs={tabs}
            componentInstanceId={APPLICATION_DETAIL_ID}
          />
        }
      >
        <SettingsPageContainer overflow="visible">
          {isNonEmptyArray(missingRequiredApplicationVariables) && (
            <SettingsApplicationMissingConfigurationBanner
              missingApplicationVariables={missingRequiredApplicationVariables}
              onConfigure={() => setActiveTabId(configurationTabId)}
            />
          )}
          {shouldDisplayHealthBanner && (
            <SettingsApplicationHealthBanner
              healthStatus={healthStatus}
              healthMessage={healthMessage}
              healthActionLabel={application?.healthActionLabel}
              onAction={() => setActiveTabId(configurationTabId)}
            />
          )}
          {isApplicationStopped && (
            <InlineBanner
              color="danger"
              LeftIcon={IconAlertTriangle}
              message={t`We are currently encountering issues with this app, its behavior may be degraded while we work on a fix.`}
            />
          )}
          {renderActiveTabContent()}
        </SettingsPageContainer>
      </SettingsPageLayout>
    </CurrentApplicationContext.Provider>
  );
};
