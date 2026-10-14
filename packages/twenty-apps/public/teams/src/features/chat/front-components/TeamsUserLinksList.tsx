import styled from '@emotion/styled';
import { useTranslate } from 'twenty-sdk/front-component';
import { themeCssVariables } from 'twenty-ui/theme';

import { useTeamsUserLinks } from 'src/features/chat/front-components/hooks/use-teams-user-links';
import { TEAMS_USER_LINK_SOURCE } from 'src/features/chat/logic-functions/constants/teams-user-link-source';

const StyledSection = styled.section`
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  margin-top: ${() => themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.h3`
  font-size: ${() => themeCssVariables.font.size.md};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  margin: 0 0 ${() => themeCssVariables.spacing[2]};
`;

const StyledList = styled.ul`
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledRow = styled.li`
  display: grid;
  font-size: ${() => themeCssVariables.font.size.md};
  gap: ${() => themeCssVariables.spacing[4]};
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  padding: ${() => themeCssVariables.spacing[3]}
    ${() => themeCssVariables.spacing[4]};

  & + & {
    border-top: 1px solid ${() => themeCssVariables.border.color.medium};
  }
`;

const StyledSecondaryText = styled.span`
  color: ${() => themeCssVariables.font.color.secondary};
`;

const TeamsUserLinksContent = () => {
  const { t } = useTranslate();
  const { teamsUserLinks, isLoading, hasLoadError } = useTeamsUserLinks();

  if (isLoading) {
    return <StyledSecondaryText>{t('Loading…')}</StyledSecondaryText>;
  }

  if (hasLoadError) {
    return (
      <p role="alert">
        {t('Could not load linked Teams accounts. Please try again.')}
      </p>
    );
  }

  if (teamsUserLinks.length === 0) {
    return (
      <StyledSecondaryText>
        {t('No Teams account is linked yet.')}
      </StyledSecondaryText>
    );
  }

  return (
    <StyledList>
      {teamsUserLinks.map((teamsUserLink) => (
        <StyledRow key={teamsUserLink.id}>
          <span>{teamsUserLink.name}</span>
          <span>{teamsUserLink.workspaceMemberName}</span>
          <StyledSecondaryText>
            {teamsUserLink.source === TEAMS_USER_LINK_SOURCE.MANUAL
              ? t('Set manually')
              : t('Matched on email')}
          </StyledSecondaryText>
        </StyledRow>
      ))}
    </StyledList>
  );
};

export const TeamsUserLinksList = () => {
  const { t } = useTranslate();

  return (
    <StyledSection aria-label={t('Linked Teams accounts')}>
      <StyledTitle>{t('Linked Teams accounts')}</StyledTitle>
      <TeamsUserLinksContent />
    </StyledSection>
  );
};
