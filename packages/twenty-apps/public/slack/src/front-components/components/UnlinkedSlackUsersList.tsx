import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

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

const StyledActionButton = styled.button`
  background: transparent;
  border: none;
  color: ${() => themeCssVariables.color.blue};
  cursor: pointer;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
  padding: 0;
`;

const StyledEmptyState = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  padding: ${() => themeCssVariables.spacing[2]};
`;

const StyledTruncationNote = styled.div`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
  padding: ${() => themeCssVariables.spacing[1]} 0;
`;

type UnlinkedSlackUsersListProps = {
  unlinkedSlackUsers: SlackResolvedUser[];
  hasMore: boolean;
  onLink: (slackUser: SlackResolvedUser) => void;
};

export const UnlinkedSlackUsersList = ({
  unlinkedSlackUsers,
  hasMore,
  onLink,
}: UnlinkedSlackUsersListProps) => {
  if (unlinkedSlackUsers.length === 0) {
    return (
      <StyledEmptyState>
        Everyone in the Slack workspace is linked.
      </StyledEmptyState>
    );
  }

  return (
    <StyledList>
      {unlinkedSlackUsers.map((slackUser) => (
        <StyledRow key={slackUser.slackUserId}>
          <StyledDetails>
            <StyledName>
              {isNonEmptyString(slackUser.displayName)
                ? slackUser.displayName
                : slackUser.slackUserId}
            </StyledName>
            <StyledMeta>
              {isNonEmptyString(slackUser.email)
                ? slackUser.email
                : slackUser.slackUserId}
            </StyledMeta>
          </StyledDetails>
          <StyledActionButton type="button" onClick={() => onLink(slackUser)}>
            Link
          </StyledActionButton>
        </StyledRow>
      ))}
      {hasMore && (
        <StyledTruncationNote>
          More unlinked users exist. Link some of these or use the pickers above
          to find a specific person.
        </StyledTruncationNote>
      )}
    </StyledList>
  );
};
