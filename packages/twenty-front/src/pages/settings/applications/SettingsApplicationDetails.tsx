import { themeCssVariables } from 'twenty-ui/theme';
import { AppChip } from '@/applications/components/AppChip';
import { CurrentApplicationContext } from '@/applications/contexts/CurrentApplicationContext';
import { useRefetchOnApplicationOperation } from '@/applications/hooks/useRefetchOnApplicationOperation';
import { useResolvedApplicationDescription } from '@/applications/hooks/useResolvedApplicationDescription';
import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsApplicationPermissionValidationModal } from '@/marketplace/components/SettingsApplicationPermissionValidationModal';
import { useApplicationUpgradePermissionSummary } from '@/marketplace/hooks/useApplicationUpgradePermissionSummary';
import { useUpgradeApplication } from '@/marketplace/hooks/useUpgradeApplication';
import { useUninstallApplication } from '@/settings/applications/hooks/useUninstallApplication';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import type { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
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
  IconDeviceFloppy,
  IconLock,
  IconSettings,
  IconVariable,
  useIcons,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import {
  FindMarketplaceAppDetailDocument,
  FindOneApplicationDocument,
  IsApplicationStoppedDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsApplicationHealthBanner } from '~/pages/settings/applications/components/SettingsApplicationHealthBanner';
import { SettingsApplicationMissingConfigurationBanner } from '~/pages/settings/applications/components/SettingsApplicationMissingConfigurationBanner';
import { CUSTOM_APPLICATION_ILLUSTRATIONS } from '~/pages/settings/applications/constants/CustomApplicationIllustrations';
import { STANDARD_APPLICATION_ILLUSTRATIONS } from '~/pages/settings/applications/constants/StandardApplicationIllustrations';
import { useApplicationHealthCheck } from '~/pages/settings/applications/hooks/useApplicationHealthCheck';
import { useApplicationVariablesDraft } from '~/pages/settings/applications/hooks/useApplicationVariablesDraft';
import { SettingsApplicationCustomSettingsSection } from '~/pages/settings/applications/tabs/SettingsApplicationCustomSettingsSection';
import { SettingsApplicationDetailGeneralTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailGeneralTab';
import { SettingsApplicationDetailVariablesTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailVariablesTab';
import { getApplicationDescriptionSummary } from '~/pages/settings/applications/utils/getApplicationDescriptionSummary';
import { getApplicationHealthBanner } from '~/pages/settings/applications/utils/getApplicationHealthBanner';
import { getDisplayedApplicationVariables } from '~/pages/settings/applications/utils/getDisplayedApplicationVariables';
import { getMissingRequiredApplicationVariables } from '~/pages/settings/applications/utils/getMissingRequiredApplicationVariables';
import { getWorkspaceSettingsMenuItems } from '~/pages/settings/applications/utils/getWorkspaceSettingsMenuItems';
import { isNewerSemver } from '~/pages/settings/applications/utils/isNewerSemver';
import { isUpgradableApplicationSourceType } from '~/pages/settings/applications/utils/isUpgradableApplicationSourceType';

const APPLICATION_DETAIL_ID = 'application-detail-id';

const GENERAL_TAB_ID = 'general';
const VARIABLES_TAB_ID = 'variables';

const UPGRADE_PERMISSION_VALIDATION_MODAL_ID =
  'upgrade-permission-validation-modal';

export const SettingsApplicationDetails = () => {
  const { applicationId = '' } = useParams<{ applicationId: string }>();
  const { getIcon } = useIcons();

  const activeTabId = useAtomComponentStateValue(
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

  const canManageApplications = useHasPermissionFlag(
    PermissionFlagType.APPLICATIONS,
  );
  const {
    permissionSummaryItems,
    isPermissionSummaryReady,
    hasPermissionSummaryError,
    refetchPermissionSummary,
  } = useApplicationUpgradePermissionSummary({
    applicationId,
    skip: !hasUpdate || !canManageApplications,
  });
  const requiresPermissionApproval = permissionSummaryItems.length > 0;
  const isUpgradeDisabled = isUpgrading || !isPermissionSummaryReady;
  const { openDialog } = useDialog();

  const upgradeToLatestVersion = async (hasUserApprovedRoleGrants: boolean) => {
    if (!isDefined(registrationId) || !isDefined(latestAvailableVersion)) {
      return;
    }

    const hasUpgraded = await upgrade({
      appRegistrationId: registrationId,
      targetVersion: latestAvailableVersion,
      hasUserApprovedRoleGrants,
    });

    if (hasUpgraded) {
      await refetch().catch(() => {});

      return;
    }

    await refetchPermissionSummary().catch(() => {});
  };

  const handleUpgrade = async () => {
    if (isUpgradeDisabled) {
      return;
    }

    if (requiresPermissionApproval) {
      openDialog(UPGRADE_PERMISSION_VALIDATION_MODAL_ID);

      return;
    }

    await upgradeToLatestVersion(false);
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

  const workspaceSettingsMenuItems = getWorkspaceSettingsMenuItems(
    application?.settingsMenuItems ?? [],
  );

  const missingRequiredApplicationVariables =
    getMissingRequiredApplicationVariables(displayedApplicationVariables);

  const hasVariablesTab =
    !isNonEmptyArray(workspaceSettingsMenuItems) &&
    displayedApplicationVariables.length > 0;

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
    // A custom settings tab lays out the application variables itself, so this tab would duplicate them
    ...(hasVariablesTab
      ? [{ id: VARIABLES_TAB_ID, title: t`Variables`, Icon: IconVariable }]
      : []),
    ...workspaceSettingsMenuItems.map((settingsMenuItem) => ({
      id: settingsMenuItem.universalIdentifier,
      title: settingsMenuItem.title,
      Icon: getIcon(settingsMenuItem.icon, 'IconAdjustments'),
    })),
  ];

  const configurationTabId = hasVariablesTab
    ? VARIABLES_TAB_ID
    : workspaceSettingsMenuItems.at(0)?.universalIdentifier;

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
            requiresPermissionApproval={requiresPermissionApproval}
            onUpgrade={handleUpgrade}
            isUpgrading={isUpgrading}
            isUpgradeDisabled={isUpgradeDisabled}
            onUninstall={uninstall}
            isUninstalling={isUninstalling}
            uninstallProgress={uninstallProgress}
          />
        );
      case VARIABLES_TAB_ID:
        return (
          <SettingsApplicationDetailVariablesTab
            applicationVariables={draftApplicationVariables}
            onVariableChange={setApplicationVariableValue}
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
              onClick={saveApplicationVariablesAndRecheckHealth}
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
          {hasPermissionSummaryError && (
            <InlineBanner
              status="error"
              icon={
                <IconAlertTriangle
                  size={themeCssVariables.icon.size.md}
                  aria-hidden="true"
                />
              }
              action={
                <InlineBanner.Action
                  onClick={() =>
                    void refetchPermissionSummary().catch(() => {})
                  }
                >{t`Retry`}</InlineBanner.Action>
              }
            >{t`Could not load the permissions requested by version ${latestAvailableVersion ?? ''}.`}</InlineBanner>
          )}
          {requiresPermissionApproval && (
            <InlineBanner
              status="info"
              icon={
                <IconLock
                  size={themeCssVariables.icon.size.md}
                  aria-hidden="true"
                />
              }
              action={
                <InlineBanner.Action
                  onClick={handleUpgrade}
                  disabled={isUpgradeDisabled}
                >{t`Review`}</InlineBanner.Action>
              }
            >{t`Version ${latestAvailableVersion ?? ''} asks for more permissions. Review them to upgrade.`}</InlineBanner>
          )}
          {isApplicationStopped && (
            <InlineBanner
              status="warning"
              icon={
                <IconAlertTriangle
                  size={themeCssVariables.icon.size.md}
                  aria-hidden="true"
                />
              }
            >{t`We are currently encountering issues with this app, its behavior may be degraded while we work on a fix.`}</InlineBanner>
          )}
          {renderActiveTabContent()}
        </SettingsPageContainer>
        <SettingsApplicationPermissionValidationModal
          modalInstanceId={UPGRADE_PERMISSION_VALIDATION_MODAL_ID}
          appDisplayName={displayName}
          appLogoUrl={application?.logoUrl ?? undefined}
          title={t`Upgrade ${displayName} to ${latestAvailableVersion ?? ''}`}
          permissionsTitle={t`This version would also like to:`}
          permissionItems={permissionSummaryItems}
          onAuthorize={() => upgradeToLatestVersion(true)}
          isLoading={isUpgrading}
        />
      </SettingsPageLayout>
    </CurrentApplicationContext.Provider>
  );
};
