import styled from '@emotion/styled';
import { H1Title, H2Title, IconSettings, Section } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/settings/components/SubMenuTopBarContainer';
import { DeleteWorkspace } from '@/settings/profile/components/DeleteWorkspace';
import { NameField } from '@/settings/workspace/components/NameField';
import { ToggleImpersonate } from '@/settings/workspace/components/ToggleImpersonate';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

export const SettingsWorkspace = () => (
  <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
    <SettingsPageContainer>
      <StyledH1Title title="General" />
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
    </SettingsPageContainer>
  </SubMenuTopBarContainer>
);
