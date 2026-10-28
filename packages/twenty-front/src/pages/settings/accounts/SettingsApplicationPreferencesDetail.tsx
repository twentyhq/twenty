import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsAppPreferencesGeneralTab } from '@/settings/app-preferences/components/SettingsAppPreferencesGeneralTab';
import { APPLICATION_PREFERENCES_GENERAL_TAB_ID } from '@/settings/app-preferences/constants/ApplicationPreferencesGeneralTabId';
import { SETTINGS_APPLICATION_PREFERENCES_TAB_LIST_COMPONENT_ID } from '@/settings/app-preferences/constants/SettingsApplicationPreferencesTabListComponentId';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { APPLICATION_VARIABLES_TAB_ID } from '@/settings/applications/constants/ApplicationVariablesTabId';
import { getApplicationConfigurationTabId } from '@/settings/applications/utils/getApplicationConfigurationTabId';
import { hasApplicationVariablesTab } from '@/settings/applications/utils/hasApplicationVariablesTab';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import type { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import {
  IconDeviceFloppy,
  IconSettings,
  IconVariable,
  useIcons,
} from 'twenty-ui/icon';
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
  refetchApplicationsWithPreferences: () => Promise<unknown>;
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

  const [updateMyUserApplicationVariable] = useMutation(
    UpdateMyUserApplicationVariableDocument,
  );

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
    refetchApplicationVariables: refetchApplicationsWithPreferences,
  });

  const hasVariablesTab = hasApplicationVariablesTab({
    settingsMenuItems,
    displayedApplicationVariables: variables,
  });

  const tabs: SingleTabProps[] = [
    {
      id: APPLICATION_PREFERENCES_GENERAL_TAB_ID,
      title: t`General`,
      Icon: IconSettings,
    },
    ...(hasVariablesTab
      ? [
          {
            id: APPLICATION_VARIABLES_TAB_ID,
            title: t`Variables`,
            Icon: IconVariable,
          },
        ]
      : []),
    ...settingsMenuItems.map((settingsMenuItem) => ({
      id: settingsMenuItem.universalIdentifier,
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
    (settingsMenuItem) => settingsMenuItem.universalIdentifier === activeTabId,
  );

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
          href: getSettingsPath(SettingsPath.Accounts),
        },
        { children: appName },
      ]}
      tabs={tabs}
      tabListComponentInstanceId={tabListComponentInstanceId}
      tabListAriaLabel={t`${appName} preferences`}
      actionButton={
        activeTabId === APPLICATION_VARIABLES_TAB_ID ? (
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
    >
      {isNonEmptyArray(missingRequiredVariables) &&
        isDefined(configurationTabId) && (
          <SettingsApplicationMissingConfigurationBanner
            missingApplicationVariables={missingRequiredVariables}
            onConfigure={() =>
              navigate(
                getSettingsPath(
                  SettingsPath.ApplicationPreferences,
                  { applicationId: application.id },
                  undefined,
                  configurationTabId,
                ),
              )
            }
          />
        )}
      <SettingsApplicationStoppedBanner
        applicationUniversalIdentifier={application.universalIdentifier}
      />
      {activeTabId === APPLICATION_PREFERENCES_GENERAL_TAB_ID && (
        <SettingsAppPreferencesGeneralTab
          application={application}
          displayName={appName}
          connectionProviders={connectionProviders}
        />
      )}
      {activeTabId === APPLICATION_VARIABLES_TAB_ID && (
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
