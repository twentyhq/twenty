import styled from '@emotion/styled';

import { DeleteWorkspace } from '@/settings/profile/components/DeleteWorkspace';
import { NameField } from '@/settings/workspace/components/NameField';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { IconSettings } from '@/ui/Display/Icon';
import { H1Title } from '@/ui/Display/Typography/components/H1Title';
import { H2Title } from '@/ui/Display/Typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/Layout/Page/SubMenuTopBarContainer';
import { Section } from '@/ui/Layout/Section/components/Section';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(8)};
  width: 350px;
`;

export const SettingsWorkspace = () => (
  <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
    <div>
      <StyledContainer>
        <H1Title title="General" />
        <Section>
          <H2Title title="Picture" />
          <WorkspaceLogoUploader />
        </Section>
        <Section>
          <H2Title title="Name" description="Name of your workspace" />
          <NameField />
        </Section>

        <Section>
          <DeleteWorkspace />
        </Section>
      </StyledContainer>
    </div>
  </SubMenuTopBarContainer>
);
