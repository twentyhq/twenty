import styled from '@emotion/styled';
import { H2Title, IconCode, IconPlus } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsApiKeysTable } from '@/settings/developers/components/SettingsApiKeysTable';
import { SettingsReadDocumentationButton } from '@/settings/developers/components/SettingsReadDocumentationButton';
import { SettingsWebhooksTable } from '@/settings/developers/components/SettingsWebhooksTable';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsDevelopers = () => {
  return (
    <SubMenuTopBarContainer
      Icon={IconCode}
      title="Desenvolvedores"
      actionButton={<SettingsReadDocumentationButton />}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title="API keys"
            description="APIs keys ativas criadas por você ou sua equipe."
          />
          <SettingsApiKeysTable />
          <StyledButtonContainer>
            <Button
              Icon={IconPlus}
              title="Criar API key"
              size="small"
              variant="secondary"
              to={'/settings/developers/api-keys/new'}
            />
          </StyledButtonContainer>
        </Section>
        <Section>
          <H2Title
            title="Webhooks"
            description="Estabeleça endpoints de Webhook para notificações em eventos assíncronos."
          />
          <SettingsWebhooksTable />
          <StyledButtonContainer>
            <Button
              Icon={IconPlus}
              title="Criar Webhook"
              size="small"
              variant="secondary"
              to={'/settings/developers/webhooks/new'}
            />
          </StyledButtonContainer>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
