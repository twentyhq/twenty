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
      title="Developers"
      actionButton={<SettingsReadDocumentationButton />}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title="API keys"
            description="Active APIs keys created by you or your team."
          />
          <SettingsApiKeysTable />
          <StyledButtonContainer>
            <Button
              Icon={IconPlus}
              title="Create API key"
              size="small"
              variant="secondary"
              to={'/settings/developers/api-keys/new'}
            />
          </StyledButtonContainer>
        </Section>
        <Section>
          <H2Title
            title="Webhooks"
            description="Establish Webhook endpoints for notifications on asynchronous events."
          />
          <SettingsWebhooksTable />
          <StyledButtonContainer>
            <Button
              Icon={IconPlus}
              title="Create Webhook"
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
