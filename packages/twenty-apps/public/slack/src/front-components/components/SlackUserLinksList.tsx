import styled from '@emotion/styled';
import { Tag } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { type SlackUserLinkRecord } from 'src/front-components/types/slack-user-link-record.type';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
`;

const StyledRow = styled.div`
  align-items: center;
  border: 1px solid ${() => themeCssVariables.border.color.light};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  gap: ${() => themeCssVariables.spacing[4]};
  justify-content: space-between;
  padding: ${() => themeCssVariables.spacing[3]};
`;

const StyledDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledName = styled.span`
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  font-weight: ${() => themeCssVariables.font.weight.medium};
`;

const StyledMeta = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
`;

const StyledEmptyState = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  padding: ${() => themeCssVariables.spacing[2]};
`;

const getSourceLabel = (source: string | null): string =>
  source === SLACK_USER_LINK_SOURCE.MANUAL ? 'Set manually' : 'Matched on email';

const getSourceColor = (source: string | null): 'blue' | 'green' =>
  source === SLACK_USER_LINK_SOURCE.MANUAL ? 'blue' : 'green';

type SlackUserLinksListProps = {
  slackUserLinks: SlackUserLinkRecord[];
  hasMore?: boolean;
};

export const SlackUserLinksList = ({
  slackUserLinks,
  hasMore = false,
}: SlackUserLinksListProps) => {
  if (slackUserLinks.length === 0) {
    return <StyledEmptyState>No Slack user links yet.</StyledEmptyState>;
  }

  return (
    <StyledList>
      {hasMore && (
        <StyledEmptyState>
          Showing the first {slackUserLinks.length} links; more exist than can be
          shown here.
        </StyledEmptyState>
      )}
      {slackUserLinks.map((slackUserLink) => (
        <StyledRow key={slackUserLink.id}>
          <StyledDetails>
            <StyledName>
              {slackUserLink.name ?? slackUserLink.slackUserId ?? 'Unnamed link'}
            </StyledName>
            <StyledMeta>
              {slackUserLink.workspaceMemberName ?? 'No workspace member'}
            </StyledMeta>
            <StyledMeta>
              Slack user {slackUserLink.slackUserId ?? 'unknown'} · Team{' '}
              {slackUserLink.slackTeamId ?? 'unknown'}
            </StyledMeta>
          </StyledDetails>
          <Tag
            color={getSourceColor(slackUserLink.source)}
            text={getSourceLabel(slackUserLink.source)}
          />
        </StyledRow>
      ))}
    </StyledList>
  );
};
