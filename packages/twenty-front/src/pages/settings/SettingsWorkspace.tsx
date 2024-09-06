import { H2Title, IconSettings } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { DeleteWorkspace } from '@/settings/profile/components/DeleteWorkspace';
import { NameField } from '@/settings/workspace/components/NameField';
import { ToggleImpersonate } from '@/settings/workspace/components/ToggleImpersonate';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';

export const SettingsWorkspace = () => (
  <SubMenuTopBarContainer Icon={IconSettings} title="Geral">
    <SettingsPageContainer>
      <Section>
        <H2Title title="Imagem" />
        <WorkspaceLogoUploader />
      </Section>
      <Section>
        <H2Title title="Nome" description="Nome do seu workspace" />
        <NameField />
      </Section>
      <Section>
        <H2Title
          title="Suporte"
          addornment={<ToggleImpersonate />}
          description="Conceda à equipe de suporte do Digito Service acesso temporário ao seu workspace para que possamos solucionar problemas ou recuperar conteúdo em seu nome. Você pode revogar o acesso a qualquer momento."
        />
      </Section>
      <Section>
        <DeleteWorkspace />
      </Section>
    </SettingsPageContainer>
  </SubMenuTopBarContainer>
);
