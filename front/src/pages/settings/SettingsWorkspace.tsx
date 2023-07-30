import styled from '@emotion/styled';

import { DeleteWorkspace } from '@/settings/profile/components/DeleteWorkspace';
import { NameField } from '@/settings/workspace/components/NameField';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { IconSettings } from '@/ui/icon';
import { SubMenuTopBarContainer } from '@/ui/layout/components/SubMenuTopBarContainer';
import { Section } from '@/ui/section/components/Section';
import { H1Title } from '@/ui/title/components/H1Title';
import { H2Title } from '@/ui/title/components/H2Title';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(8)};
  width: 350px;
`;

export function SettingsWorksapce() {
  return (
    <SubMenuTopBarContainer icon={<IconSettings size={16} />} title="Settings">
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
}
