import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsApiKeysTable } from '@/settings/developers/components/SettingsApiKeysTable';
import { SettingsWebhooksTable } from '@/settings/developers/components/SettingsWebhooksTable';
import { PlaygroundSetupForm } from '@/settings/playground/components/PlaygroundSetupForm';
import { StyledSettingsApiPlaygroundCoverImage } from '@/settings/playground/components/SettingsPlaygroundCoverImage';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-top: ${({ theme }) => theme.spacing(5)};
  }
`;

const StyledMainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(10)};
  min-height: 200px;
`;

const StyledSection = styled(Section)`
  flex-shrink: 0;
`;

const StyledContainer = styled.div<{ isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  overflow: ${({ isMobile }) => (isMobile ? 'hidden' : 'visible')};
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsApiWebhooks = () => {
  const isMobile = useIsMobile();
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`APIs & Webhooks`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>APIs & Webhooks</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <StyledMainContent>
          <StyledSection>
            <H2Title
              title={t`Documentation`}
              description={t`Try our REST or GraphQL API playgrounds.`}
            />
            <StyledContainer>
              <StyledSettingsApiPlaygroundCoverImage />
              <PlaygroundSetupForm />
            </StyledContainer>
          </StyledSection>

          <StyledSection>
            <H2Title
              title={t`API Keys`}
              description={t`Active API keys created by you or your team.`}
            />
            <StyledContainer isMobile={isMobile}>
              <SettingsApiKeysTable />
              <StyledButtonContainer>
                <Button
                  Icon={IconPlus}
                  title={t`Create API key`}
                  size="small"
                  variant="secondary"
                  to={getSettingsPath(SettingsPath.NewApiKey)}
                />
              </StyledButtonContainer>
            </StyledContainer>
          </StyledSection>

          <StyledSection>
            <H2Title
              title={t`Webhooks`}
              description={t`Establish Webhook endpoints for notifications on asynchronous events.`}
            />
            <StyledContainer isMobile={isMobile}>
              <SettingsWebhooksTable />
              <StyledButtonContainer>
                <Button
                  Icon={IconPlus}
                  title={t`Create webhook`}
                  size="small"
                  variant="secondary"
                  to={getSettingsPath(SettingsPath.NewWebhook)}
                />
              </StyledButtonContainer>
            </StyledContainer>
          </StyledSection>
        </StyledMainContent>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
