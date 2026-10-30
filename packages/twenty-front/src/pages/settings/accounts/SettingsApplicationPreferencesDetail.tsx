import {
  SETTINGS_GENERAL_TAB_ID,
  SETTINGS_VARIABLES_TAB_ID,
} from 'twenty-shared/application';
import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsAppPreferencesGeneralTab } from '@/settings/app-preferences/components/SettingsAppPreferencesGeneralTab';
import { MY_APPLICATION_HEALTH_CHECK_RUNNER } from '@/settings/app-preferences/constants/MyApplicationHealthCheckRunner';
import { SETTINGS_APPLICATION_PREFERENCES_TAB_LIST_COMPONENT_ID } from '@/settings/app-preferences/constants/SettingsApplicationPreferencesTabListComponentId';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { type useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { useRefetchApplicationPreferencesVariables } from '@/settings/app-preferences/hooks/useRefetchApplicationPreferencesVariables';
import { SettingsApplicationHealthCheckBanner } from '@/settings/applications/components/SettingsApplicationHealthCheckBanner';
import { SettingsApplicationHealthCheckEffect } from '@/settings/applications/components/SettingsApplicationHealthCheckEffect';
import { useSaveApplicationVariablesAndRecheckHealth } from '@/settings/applications/hooks/useSaveApplicationVariablesAndRecheckHealth';
import { getApplicationConfigurationTabId } from '@/settings/applications/utils/getApplicationConfigurationTabId';
import { getSettingsMenuItemLegacyTabIdRedirect } from '@/settings/applications/utils/getSettingsMenuItemLegacyTabIdRedirect';
import { getSettingsMenuItemTabId } from '@/settings/applications/utils/getSettingsMenuItemTabId';
import { hasApplicationVariablesTab } from '@/settings/applications/utils/hasApplicationVariablesTab';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import type { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { IconDeviceFloppy, IconSettings, IconVariable } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { Button } from 'twenty-ui/primitives/input';
import {
  ApplicationVariableScope,
  UpdateMyUserApplicationVariableDocument,
} from '~/generated-metadata/graphql';
import { useApplicationVariablesDraft } from '@/settings/applications/hooks/useApplicationVariablesDraft';
import { SettingsApplicationCustomSettingsSection } from '@/settings/applications/components/SettingsApplicationCustomSettingsSection';
import { SettingsApplicationDetailVariablesTab } from '@/settings/applications/components/SettingsApplicationDetailVariablesTab';
import { SettingsApplicationMissingConfigurationBanner } from '@/settings/applications/components/SettingsApplicationMissingConfigurationBanner';
import { SettingsApplicationDetailPageLayout } from '@/settings/applications/components/SettingsApplicationDetailPageLayout';
import { SettingsApplicationStoppedBanner } from '@/settings/applications/components/SettingsApplicationStoppedBanner';

type SettingsApplicationPreferencesDetailProps = {
  applicationWithPreferences: ApplicationWithPreferences;
  refetchApplicationsWithPreferences: ReturnType<
    typeof useApplicationsWithPreferences
  >['refetch'];
};

export const SettingsApplicationPreferencesDetail = ({
  applicationWithPreferences: {
    application,
    settingsMenuItems,
    variables,
    missingRequiredVariables,
    connectionProviders,
  },
  refetchApplicationsWithPreferences,
}: SettingsApplicationPreferencesDetailProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const navigate = useNavigate();
  const { search, hash } = useLocation();

  const [updateMyUserApplicationVariable] = useMutation(
    UpdateMyUserApplicationVariableDocument,
  );

  const { refetchApplicationVariables } =
    useRefetchApplicationPreferencesVariables({
      applicationId: application.id,
      refetchApplicationsWithPreferences,
    });

  const {
    draftApplicationVariables,
    setApplicationVariableValue,
    clearApplicationVariableValue,
    hasUnsavedApplicationVariables,
    saveApplicationVariables,
    isSavingApplicationVariables,
  } = useApplicationVariablesDraft({
    applicationId: application.id,
    scope: ApplicationVariableScope.USER,
    applicationVariables: variables,
    updateApplicationVariable: ({ key, value }) =>
      updateMyUserApplicationVariable({
        variables: {
          applicationUniversalIdentifier: application.universalIdentifier,
          key,
          value,
        },
      }),
    refetchApplicationVariables,
  });

  const hasMissingRequiredVariables = isNonEmptyArray(missingRequiredVariables);

  const { saveApplicationVariablesAndRecheckHealth } =
    useSaveApplicationVariablesAndRecheckHealth({
      applicationId: application.id,
      runner: MY_APPLICATION_HEALTH_CHECK_RUNNER,
      hasMissingRequiredVariables,
      saveApplicationVariables,
    });

  const hasVariablesTab = hasApplicationVariablesTab({
    settingsMenuItems,
    displayedApplicationVariables: variables,
  });

  const tabs: SingleTabProps[] = [
    {
      id: SETTINGS_GENERAL_TAB_ID,
      title: t`General`,
      Icon: IconSettings,
    },
    ...(hasVariablesTab
      ? [
          {
            id: SETTINGS_VARIABLES_TAB_ID,
            title: t`Variables`,
            Icon: IconVariable,
          },
        ]
      : []),
    ...settingsMenuItems.map((settingsMenuItem) => ({
      id: getSettingsMenuItemTabId(settingsMenuItem),
      title: settingsMenuItem.title,
      Icon: getIcon(settingsMenuItem.icon, 'IconAdjustments'),
    })),
  ];

  const tabListComponentInstanceId = `${SETTINGS_APPLICATION_PREFERENCES_TAB_LIST_COMPONENT_ID}-${application.id}`;

  const activeTabId = useSettingsActiveTabId(
    tabListComponentInstanceId,
    tabs.map((tab) => tab.id),
  );

  const appName = getApplicationDisplayName({
    application,
    currentWorkspace,
  });

  const configurationTabId = getApplicationConfigurationTabId({
    hasVariablesTab,
    settingsMenuItems,
  });

  const activeSettingsMenuItem = settingsMenuItems.find(
    (settingsMenuItem) =>
      getSettingsMenuItemTabId(settingsMenuItem) === activeTabId,
  );

  const legacyTabIdRedirect = getSettingsMenuItemLegacyTabIdRedirect({
    settingsMenuItems,
    hashTabId: hash.replace('#', ''),
  });

  if (isDefined(legacyTabIdRedirect)) {
    return (
      <Navigate to={{ search, hash: `#${legacyTabIdRedirect}` }} replace />
    );
  }

  return (
    <SettingsApplicationDetailPageLayout
      applicationId={application.id}
      displayName={appName}
      links={[
        {
          children: t`User`,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: t`Apps preferences`,
          href: getSettingsPath(SettingsPath.AppPreferences),
        },
        { children: appName },
      ]}
      tabs={tabs}
      tabListComponentInstanceId={tabListComponentInstanceId}
      tabListAriaLabel={t`${appName} preferences`}
      actionButton={
        activeTabId === SETTINGS_VARIABLES_TAB_ID ? (
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
    >
      {isNonEmptyArray(missingRequiredVariables) &&
        isDefined(configurationTabId) && (
          <SettingsApplicationMissingConfigurationBanner
            missingApplicationVariables={missingRequiredVariables}
            onConfigure={() =>
              navigate(
                getSettingsPath(
                  SettingsPath.AppPreferencesApp,
                  { applicationId: application.id },
                  undefined,
                  configurationTabId,
                ),
              )
            }
          />
        )}
      {!hasMissingRequiredVariables && (
        <>
          <SettingsApplicationHealthCheckEffect
            key={application.id}
            applicationId={application.id}
            runner={MY_APPLICATION_HEALTH_CHECK_RUNNER}
          />
          <SettingsApplicationHealthCheckBanner
            applicationId={application.id}
            healthCheckFamilyState={
              MY_APPLICATION_HEALTH_CHECK_RUNNER.healthCheckFamilyState
            }
            fallbackLocation={
              activeTabId === SETTINGS_GENERAL_TAB_ID
                ? undefined
                : getSettingsPath(
                    SettingsPath.AppPreferencesApp,
                    { applicationId: application.id },
                    undefined,
                    SETTINGS_GENERAL_TAB_ID,
                  )
            }
          />
        </>
      )}
      <SettingsApplicationStoppedBanner
        applicationUniversalIdentifier={application.universalIdentifier}
      />
      {activeTabId === SETTINGS_GENERAL_TAB_ID && (
        <SettingsAppPreferencesGeneralTab
          application={application}
          displayName={appName}
          connectionProviders={connectionProviders}
          settingsMenuItems={settingsMenuItems}
        />
      )}
      {activeTabId === SETTINGS_VARIABLES_TAB_ID && (
        <SettingsApplicationDetailVariablesTab
          applicationVariables={draftApplicationVariables}
          onVariableChange={setApplicationVariableValue}
          onVariableClear={clearApplicationVariableValue}
        />
      )}
      {isDefined(activeSettingsMenuItem) && (
        <SettingsApplicationCustomSettingsSection
          frontComponentId={activeSettingsMenuItem.frontComponentId}
        />
      )}
    </SettingsApplicationDetailPageLayout>
  );
};
