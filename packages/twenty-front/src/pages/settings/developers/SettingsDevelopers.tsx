import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsApiKeysTable } from '@/settings/developers/components/SettingsApiKeysTable';
import { SettingsReadDocumentationButton } from '@/settings/developers/components/SettingsReadDocumentationButton';
import { SettingsWebhooksTable } from '@/settings/developers/components/SettingsWebhooksTable';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { Button, H2Title, IconPlus, MOBILE_VIEWPORT, Section } from 'twenty-ui';

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-top: ${({ theme }) => theme.spacing(5)};
  }
`;

const StyledContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsDevelopers = () => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  return (
    <SubMenuTopBarContainer
      title={t('developers')}
      actionButton={<SettingsReadDocumentationButton />}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: t('developers')},
      ]}
    >
      <SettingsPageContainer>
        <StyledContainer isMobile={isMobile}>
          <Section>
            <H2Title
              title={t('apiKeys')}
              description={t('apiKeysDescription')}
            />
            <SettingsApiKeysTable />
            <StyledButtonContainer>
              <Button
                Icon={IconPlus}
                title={t('createApiKey')}
                size="small"
                variant="secondary"
                to={'/settings/developers/api-keys/new'}
              />
            </StyledButtonContainer>
          </Section>
          <Section>
            <H2Title
              title={t('webhooks')}
              description={t('webhookDescription')}
            />
            <SettingsWebhooksTable />
            <StyledButtonContainer>
              <Button
                Icon={IconPlus}
                title={t('createWebhook')}
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
