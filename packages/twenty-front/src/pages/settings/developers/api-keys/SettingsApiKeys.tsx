import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsApiKeysTable } from '@/settings/developers/components/SettingsApiKeysTable';
import { SettingsReadDocumentationButton } from '@/settings/developers/components/SettingsReadDocumentationButton';
import { ApiPlaygroundSetupForm } from '@/settings/playground/components/ApiPlaygroundSetupForm';
import { StyledSettingsApiPlaygroundCoverImage } from '@/settings/playground/components/SettingsApiPlaygroundCoverImage';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button, H2Title, IconPlus, MOBILE_VIEWPORT, Section } from 'twenty-ui';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-top: ${({ theme }) => theme.spacing(5)};
  }
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsApiKeys = () => {
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`APIs`}
      actionButton={<SettingsReadDocumentationButton />}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>API Keys</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <StyledContainer>
          <Section>
            <H2Title
              title={t`Playground`}
              description={t`Try our REST or GraphQL API playgrounds.`}
            />
            <StyledSettingsApiPlaygroundCoverImage />
            <ApiPlaygroundSetupForm />
          </Section>
          <Section>
            <H2Title
              title={t`API keys`}
              description={t`Active API keys created by you or your team.`}
            />
            <SettingsApiKeysTable />
            <StyledButtonContainer>
              <Button
                Icon={IconPlus}
                title={t`Create API key`}
                size="small"
                variant="secondary"
                to={getSettingsPath(SettingsPath.DevelopersNewApiKey)}
              />
            </StyledButtonContainer>
          </Section>
        </StyledContainer>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
