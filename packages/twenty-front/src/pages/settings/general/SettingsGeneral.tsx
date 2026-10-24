import { useLingui } from '@lingui/react/macro';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { useIsLogConsoleAllowed } from '@/log-console/hooks/useIsLogConsoleAllowed';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { SettingsWorkspaceDomainCard } from '@/settings/domains/components/SettingsWorkspaceDomainCard';
import { SettingsLogs } from '@/settings/event-logs/components/SettingsLogs';
import { DeleteWorkspace } from '@/settings/profile/components/DeleteWorkspace';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SettingsPrivacy } from '@/settings/privacy/components/SettingsPrivacy';
import { useIsAiDataPolicyConfigurable } from '@/settings/privacy/hooks/useIsAiDataPolicyConfigurable';
import { SettingsSecuritySettings } from '@/settings/security/components/SettingsSecuritySettings';
import { NameField } from '@/settings/workspace/components/NameField';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Section } from 'twenty-ui/components/layout';
import {
  IconHistory,
  IconKey,
  IconSettings2,
  IconShield,
} from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const SETTINGS_GENERAL_TABS_INSTANCE_ID = 'settings-general-tabs';

const GENERAL_TAB_GENERAL = 'general';
const GENERAL_TAB_SECURITY = 'security';
const GENERAL_TAB_PRIVACY = 'privacy';
const GENERAL_TAB_LOGS = 'logs';

export const SettingsGeneral = () => {
  const { t } = useLingui();

  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );

  const hasSecurityPermission = useHasPermissionFlag(
    PermissionFlagType.SECURITY,
  );

  const isLogConsoleAllowed = useIsLogConsoleAllowed();
  const isAiDataPolicyConfigurable = useIsAiDataPolicyConfigurable();
  const hasPrivacySettings =
    isMultiWorkspaceEnabled || isAiDataPolicyConfigurable;

  // the log console is reachable from the navigation drawer, so the Logs tab only remains where it is not
  const tabs = [
    {
      id: GENERAL_TAB_GENERAL,
      title: t`General`,
      Icon: IconSettings2,
    },
    ...(hasSecurityPermission
      ? [
          { id: GENERAL_TAB_SECURITY, title: t`Security`, Icon: IconKey },
          ...(hasPrivacySettings
            ? [{ id: GENERAL_TAB_PRIVACY, title: t`Privacy`, Icon: IconShield }]
            : []),
          ...(isLogConsoleAllowed
            ? []
            : [{ id: GENERAL_TAB_LOGS, title: t`Logs`, Icon: IconHistory }]),
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

    if (activeTabId === GENERAL_TAB_PRIVACY) {
      return <SettingsPrivacy />;
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
            aria-label={t`General settings`}
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
