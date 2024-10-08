import styled from '@emotion/styled';
import { H2Title, IconCode, IconPlus, MOBILE_VIEWPORT } from 'twenty-ui';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsApiKeysTable } from '@/settings/developers/components/SettingsApiKeysTable';
import { SettingsReadDocumentationButton } from '@/settings/developers/components/SettingsReadDocumentationButton';
import { SettingsWebhooksTable } from '@/settings/developers/components/SettingsWebhooksTable';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const SettingsDevelopers = () => {
  const isMobile = useIsMobile();
  return (
    <SubMenuTopBarContainer
      Icon={IconCode}
      title="Developers"
      actionButton={<SettingsReadDocumentationButton />}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Developers' },
      ]}
    >
      <SettingsPageContainer>
        <StyledContainer isMobile={isMobile}>
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
        </StyledContainer>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
