import { useLingui } from '@lingui/react/macro';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
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
import { Section } from 'twenty-ui/components';
import { IconHistory, IconKey, IconSettings } from 'twenty-ui/icon';
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
        <Section.Root>
          <Section.Header title={t`Picture`} />
          <WorkspaceLogoUploader />
        </Section.Root>
        <Section.Root>
          <Section.Header
            title={t`Name`}
            description={t`Name of your workspace`}
          />
          <NameField />
        </Section.Root>
        {isMultiWorkspaceEnabled && (
          <Section.Root>
            <Section.Header
              title={t`Workspace domain`}
              description={t`Edit your subdomain name or set a custom domain.`}
            />
            <SettingsWorkspaceDomainCard />
          </Section.Root>
        )}
        <Section.Root>
          <DeleteWorkspace />
        </Section.Root>
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
