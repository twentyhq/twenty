import { useLingui } from '@lingui/react/macro';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsWorkspaceBlocklistSection } from '@/settings/workspace/components/SettingsWorkspaceBlocklistSection';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const SettingsWorkspaceBlocklist = () => {
  const { t } = useLingui();

  return (
    <SettingsPageLayout
      title={t`Blocklist`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Communication`,
          href: getSettingsPath(SettingsPath.WorkspaceCommunications),
        },
        { children: t`Blocklist` },
      ]}
    >
      <SettingsPageContainer>
        <SettingsWorkspaceBlocklistSection />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
