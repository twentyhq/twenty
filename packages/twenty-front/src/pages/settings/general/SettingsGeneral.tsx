import { useLingui } from '@lingui/react/macro';

import { isCloudflareIntegrationEnabledState } from '@/client-config/states/isCloudflareIntegrationEnabledState';
import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { isMultiWorkspaceSubdomainEnabledState } from '@/client-config/states/isMultiWorkspaceSubdomainEnabledState';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { SettingsWorkspaceDomainCard } from '@/settings/domains/components/SettingsWorkspaceDomainCard';
import { SettingsLogs } from '@/settings/event-logs/components/SettingsLogs';
import { DeleteWorkspace } from '@/settings/profile/components/DeleteWorkspace';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SettingsSecuritySettings } from '@/settings/security/components/SettingsSecuritySettings';
import { NameField } from '@/settings/workspace/components/NameField';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { IconHistory, IconKey, IconSettings } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const SETTINGS_GENERAL_TABS_INSTANCE_ID = 'settings-general-tabs';

const GENERAL_TAB_GENERAL = 'general';
const GENERAL_TAB_SECURITY = 'security';
const GENERAL_TAB_LOGS = 'logs';

export const SettingsGeneral = () => {
  const { t } = useLingui();

  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );
  const isMultiWorkspaceSubdomainEnabled = useAtomStateValue(
    isMultiWorkspaceSubdomainEnabledState,
  );
  const isCloudflareIntegrationEnabled = useAtomStateValue(
    isCloudflareIntegrationEnabledState,
  );

  const hasSecurityPermission = useHasPermissionFlag(
    PermissionFlagType.SECURITY,
  );

  const tabs = [
    { id: GENERAL_TAB_GENERAL, title: t`General`, Icon: IconSettings },
    ...(hasSecurityPermission
      ? [
          { id: GENERAL_TAB_SECURITY, title: t`Security`, Icon: IconKey },
          { id: GENERAL_TAB_LOGS, title: t`Logs`, Icon: IconHistory },
        ]
      : []),
  ];

  const activeTabId = useSettingsActiveTabId(
    SETTINGS_GENERAL_TABS_INSTANCE_ID,
    tabs.map((tab) => tab.id),
  );

  const renderActiveTabContent = () => {
    if (activeTabId === GENERAL_TAB_SECURITY) {
      return <SettingsSecuritySettings />;
    }

    return (
      <>
        <Section>
          <H2Title title={t`Picture`} />
          <WorkspaceLogoUploader />
        </Section>
        <Section>
          <H2Title title={t`Name`} description={t`Name of your workspace`} />
          <NameField />
        </Section>
        {isMultiWorkspaceEnabled &&
          (isMultiWorkspaceSubdomainEnabled ||
            isCloudflareIntegrationEnabled) && (
            <Section>
              <H2Title
                title={t`Workspace domain`}
                description={
                  isMultiWorkspaceSubdomainEnabled
                    ? t`Edit your subdomain name or set a custom domain.`
                    : t`Set a custom domain for your workspace.`
                }
              />
              <SettingsWorkspaceDomainCard />
            </Section>
          )}
        <Section>
          <DeleteWorkspace />
        </Section>
      </>
    );
  };

  return (
    <SettingsPageLayout
      title={t`General`}
      secondaryBar={
        hasSecurityPermission ? (
          <SettingsTabBar
            tabs={tabs}
            componentInstanceId={SETTINGS_GENERAL_TABS_INSTANCE_ID}
          />
        ) : undefined
      }
      links={[{ children: t`Workspace` }, { children: t`General` }]}
    >
      {activeTabId === GENERAL_TAB_LOGS ? (
        <SettingsLogs />
      ) : (
        <SettingsPageContainer>
          {renderActiveTabContent()}
        </SettingsPageContainer>
      )}
    </SettingsPageLayout>
  );
};
