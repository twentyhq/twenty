import { H2Title } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { DeleteWorkspace } from '@/settings/profile/components/DeleteWorkspace';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { NameField } from '@/settings/workspace/components/NameField';
import { ToggleImpersonate } from '@/settings/workspace/components/ToggleImpersonate';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { GithubVersionLink } from '@/ui/navigation/link/components/GithubVersionLink';

export const SettingsWorkspace = () => (
  <SubMenuTopBarContainer
    title="General"
    links={[
      {
        children: 'Workspace',
        href: getSettingsPagePath(SettingsPath.Workspace),
      },
      { children: 'General' },
    ]}
  >
    <SettingsPageContainer>
      <Section>
        <H2Title title="Picture" />
        <WorkspaceLogoUploader />
      </Section>
      <Section>
        <H2Title title="Name" description="Name of your workspace" />
        <NameField />
      </Section>
      <Section>
        <H2Title
          title="Support"
          addornment={<ToggleImpersonate />}
          description="Grant Twenty support temporary access to your workspace so we can troubleshoot problems or recover content on your behalf. You can revoke access at any time."
        />
      </Section>
      <Section>
        <DeleteWorkspace />
      </Section>
      <Section>
        <GithubVersionLink />
      </Section>
    </SettingsPageContainer>
  </SubMenuTopBarContainer>
);
