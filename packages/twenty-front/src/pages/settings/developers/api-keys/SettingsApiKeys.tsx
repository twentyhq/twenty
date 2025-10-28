import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsApiKeysTable } from '@/settings/developers/components/SettingsApiKeysTable';
import { PlaygroundSetupForm } from '@/settings/playground/components/PlaygroundSetupForm';
import { StyledSettingsApiPlaygroundCoverImage } from '@/settings/playground/components/SettingsPlaygroundCoverImage';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
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

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: visible;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsApiKeys = () => {
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`APIs`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>APIs</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <StyledContainer>
          <Section>
            <H2Title
              title={t`Documentation`}
              description={t`Try our REST or GraphQL API playgrounds.`}
            />
            <StyledSettingsApiPlaygroundCoverImage />
            <PlaygroundSetupForm />
          </Section>
        </StyledContainer>
        <StyledContainer>
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
                to={getSettingsPath(SettingsPath.NewApiKey)}
              />
            </StyledButtonContainer>
          </Section>
        </StyledContainer>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
