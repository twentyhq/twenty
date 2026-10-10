import { AppChip } from '@/applications/components/AppChip';
import { CurrentApplicationContext } from '@/applications/contexts/CurrentApplicationContext';
import { getApplicationDisplayName } from '@/applications/utils/getApplicationDisplayName';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SETTINGS_APPLICATION_PREFERENCES_TAB_LIST_COMPONENT_ID } from '@/settings/app-preferences/constants/SettingsApplicationPreferencesTabListComponentId';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { hasApplicationVariablesTab } from '@/settings/applications/utils/hasApplicationVariablesTab';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import type { SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconDeviceFloppy, IconVariable, useIcons } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import {
  ApplicationVariableScope,
  UpdateMyUserApplicationVariableDocument,
} from '~/generated-metadata/graphql';
import { useApplicationVariablesDraft } from '~/pages/settings/applications/hooks/useApplicationVariablesDraft';
import { SettingsApplicationCustomSettingsSection } from '~/pages/settings/applications/tabs/SettingsApplicationCustomSettingsSection';
import { SettingsApplicationDetailVariablesTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailVariablesTab';

const VARIABLES_TAB_ID = 'variables';

type SettingsApplicationPreferencesDetailProps = {
  applicationWithPreferences: ApplicationWithPreferences;
  refetchApplicationsWithPreferences: () => Promise<unknown>;
};

export const SettingsApplicationPreferencesDetail = ({
  applicationWithPreferences: { application, settingsMenuItems, variables },
  refetchApplicationsWithPreferences,
}: SettingsApplicationPreferencesDetailProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const [updateMyUserApplicationVariable] = useMutation(
    UpdateMyUserApplicationVariableDocument,
  );

  const {
    draftApplicationVariables,
    setApplicationVariableValue,
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
    ...(hasVariablesTab
      ? [{ id: VARIABLES_TAB_ID, title: t`Variables`, Icon: IconVariable }]
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

  const activeSettingsMenuItem = settingsMenuItems.find(
    (settingsMenuItem) => settingsMenuItem.universalIdentifier === activeTabId,
  );

  return (
    <CurrentApplicationContext.Provider value={application.id}>
      <SettingsPageLayout
        title={appName}
        icon={<AppChip applicationId={application.id} size="md" chipOnly />}
        links={[
          {
            children: t`User`,
            href: getSettingsPath(SettingsPath.ProfilePage),
          },
          {
            children: t`App preferences`,
            href: getSettingsPath(SettingsPath.Accounts),
          },
          { children: appName },
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
            aria-label={t`${appName} preferences`}
            tabs={tabs}
            componentInstanceId={tabListComponentInstanceId}
          />
        }
      >
        <SettingsPageContainer overflow="visible">
          {activeTabId === VARIABLES_TAB_ID && (
            <SettingsApplicationDetailVariablesTab
              applicationVariables={draftApplicationVariables}
              onVariableChange={setApplicationVariableValue}
            />
          )}
          {isDefined(activeSettingsMenuItem) && (
            <SettingsApplicationCustomSettingsSection
              frontComponentId={activeSettingsMenuItem.frontComponentId}
            />
          )}
        </SettingsPageContainer>
      </SettingsPageLayout>
    </CurrentApplicationContext.Provider>
  );
};
