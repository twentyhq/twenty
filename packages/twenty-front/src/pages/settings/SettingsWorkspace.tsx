import styled from '@emotion/styled';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { DeleteWorkspace } from '@/settings/profile/components/DeleteWorkspace';
import { NameField } from '@/settings/workspace/components/NameField';
import { ToggleImpersonate } from '@/settings/workspace/components/ToggleImpersonate';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { IconSettings } from '@/ui/display/icon';
import { H1Title } from '@/ui/display/typography/components/H1Title';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import useI18n from '@/ui/i18n/useI18n';

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

export const SettingsWorkspace = () => {
  const { translate } = useI18n('translations');

  return (
  <SubMenuTopBarContainer Icon={IconSettings} title={translate('settings')}>
    <SettingsPageContainer>
      <StyledH1Title title={translate('general')} />
      <Section>
        <H2Title title={translate('picture')} />
        <WorkspaceLogoUploader />
      </Section>
      <Section>
        <H2Title title={translate('name')} description={translate('nameOfYourWorkspace')} />
        <NameField />
      </Section>
      <Section>
        <H2Title
          title={translate('support')}
          addornment={<ToggleImpersonate />}
          description={translate('supportDsc')}
        />
      </Section>
      <Section>
        <DeleteWorkspace />
      </Section>
    </SettingsPageContainer>
  </SubMenuTopBarContainer>
)};
