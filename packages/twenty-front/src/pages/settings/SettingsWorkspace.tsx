import { useLingui } from '@lingui/react/macro';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsTabBar } from '@/settings/components/layout/SettingsTabBar';
import { SettingsWorkspaceDomainCard } from '@/settings/domains/components/SettingsWorkspaceDomainCard';
import { DeleteWorkspace } from '@/settings/profile/components/DeleteWorkspace';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SettingsSecuritySettings } from '@/settings/security/components/SettingsSecuritySettings';
import { NameField } from '@/settings/workspace/components/NameField';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconKey, IconSettings } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const SETTINGS_GENERAL_TABS_INSTANCE_ID = 'settings-general-tabs';

// The Security tab id doubles as a URL hash, so SettingsPath.Security
// (general#security) deep-links straight to it via hash sync.
const GENERAL_TAB_GENERAL = 'general';
const GENERAL_TAB_SECURITY = 'security';

export const SettingsWorkspace = () => {
  const { t } = useLingui();

  const isMultiWorkspaceEnabled = useAtomStateValue(
    isMultiWorkspaceEnabledState,
  );

  const hasSecurityPermission = useHasPermissionFlag(
    PermissionFlagType.SECURITY,
  );

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    SETTINGS_GENERAL_TABS_INSTANCE_ID,
  );

  const tabs = [
    { id: GENERAL_TAB_GENERAL, title: t`General`, Icon: IconSettings },
    ...(hasSecurityPermission
      ? [{ id: GENERAL_TAB_SECURITY, title: t`Security`, Icon: IconKey }]
      : []),
  ];

  const renderActiveTabContent = () => {
    if (hasSecurityPermission && activeTabId === GENERAL_TAB_SECURITY) {
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
        {isMultiWorkspaceEnabled && (
          <Section>
            <H2Title
              title={t`Workspace Domain`}
              description={t`Edit your subdomain name or set a custom domain.`}
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
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`General` },
      ]}
    >
      <SettingsPageContainer>{renderActiveTabContent()}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
