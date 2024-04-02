import styled from '@emotion/styled';
import { IconSettings } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { DeleteWorkspace } from '@/settings/profile/components/DeleteWorkspace';
import { NameField } from '@/settings/workspace/components/NameField';
import { ToggleImpersonate } from '@/settings/workspace/components/ToggleImpersonate';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { H1Title } from '@/ui/display/typography/components/H1Title';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';

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
