import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { IconPlus, IconSettings } from 'twenty-ui';

import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsApiKeysTable } from '@/settings/developers/components/SettingsApiKeysTable';
import { SettingsReadDocumentationButton } from '@/settings/developers/components/SettingsReadDocumentationButton';
import { SettingsWebhooksTable } from '@/settings/developers/components/SettingsWebhooksTable';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsDevelopers = () => {
  const navigate = useNavigate();

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb links={[{ children: 'Developers' }]} />
          <SettingsReadDocumentationButton />
        </SettingsHeaderContainer>
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
              onClick={() => {
                navigate('/settings/developers/api-keys/new');
              }}
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
              onClick={() => {
                navigate('/settings/developers/webhooks/new');
              }}
            />
          </StyledButtonContainer>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
