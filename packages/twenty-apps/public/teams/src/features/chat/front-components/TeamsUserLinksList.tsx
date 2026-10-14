import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { enqueueSnackbar, useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Tag, type TagColor } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { useRemoveTeamsUserLink } from 'src/features/chat/front-components/hooks/use-remove-teams-user-link';
import { useTeamsUserLinks } from 'src/features/chat/front-components/hooks/use-teams-user-links';
import { TEAMS_USER_LINK_SOURCE } from 'src/features/chat/logic-functions/constants/teams-user-link-source';
import { type TeamsUserLinkSource } from 'src/features/chat/logic-functions/types/teams-user-link-source.type';
import { type TeamsUserLinkRecord } from 'src/features/chat/front-components/types/teams-user-link-record.type';

const SOURCE_TAG_COLORS: Record<TeamsUserLinkSource, TagColor> = {
  [TEAMS_USER_LINK_SOURCE.AUTO]: 'green',
  [TEAMS_USER_LINK_SOURCE.MANUAL]: 'blue',
};

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
  align-items: center;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto auto;
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
  const {
    teamsUserLinks,
    isLoading,
    hasLoadError,
    canManageTeamsUserLinks,
    dropTeamsUserLink,
  } = useTeamsUserLinks();
  const { removeTeamsUserLink, removingLinkId } = useRemoveTeamsUserLink();

  const handleRemove = async (teamsUserLink: TeamsUserLinkRecord) => {
    const isRemoved = await removeTeamsUserLink(teamsUserLink.id);

    if (!isRemoved) {
      enqueueSnackbar({
        message: t('Could not remove the link. Please try again.'),
        variant: 'error',
      });

      return;
    }

    dropTeamsUserLink(teamsUserLink.id);
    enqueueSnackbar({ message: t('Link removed'), variant: 'success' });
  };

  const sourceLabels: Record<TeamsUserLinkSource, string> = {
    [TEAMS_USER_LINK_SOURCE.AUTO]: t('Matched on email'),
    [TEAMS_USER_LINK_SOURCE.MANUAL]: t('Set manually'),
  };

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
      {teamsUserLinks.map((teamsUserLink) => {
        const teamsAccountName = isNonEmptyString(teamsUserLink.name)
          ? teamsUserLink.name
          : t('Unnamed Teams account');

        return (
          <StyledRow key={teamsUserLink.id}>
            <OverflowingTextWithTooltip text={teamsAccountName} />
            <OverflowingTextWithTooltip
              text={
                isNonEmptyString(teamsUserLink.workspaceMemberName)
                  ? teamsUserLink.workspaceMemberName
                  : t('No workspace member')
              }
            />
            <span>
              {isDefined(teamsUserLink.source) && (
                <Tag color={SOURCE_TAG_COLORS[teamsUserLink.source]}>
                  {sourceLabels[teamsUserLink.source]}
                </Tag>
              )}
            </span>
            {canManageTeamsUserLinks && (
              <Button
                variant="ghost"
                color="danger"
                size="sm"
                aria-label={t('Remove link for {name}', {
                  name: teamsAccountName,
                })}
                loading={removingLinkId === teamsUserLink.id}
                disabled={isDefined(removingLinkId)}
                onClick={() => handleRemove(teamsUserLink)}
              >
                {t('Remove')}
              </Button>
            )}
          </StyledRow>
        );
      })}
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
