import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { UnlinkedSlackUserRow } from 'src/front-components/components/UnlinkedSlackUserRow';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
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
  onLinkSaved: () => void;
};

export const UnlinkedSlackUsersList = ({
  unlinkedSlackUsers,
  hasMore,
  onLinkSaved,
}: UnlinkedSlackUsersListProps) => {
  if (unlinkedSlackUsers.length === 0 && !hasMore) {
    return (
      <StyledEmptyState>
        Everyone in the Slack workspace is linked.
      </StyledEmptyState>
    );
  }

  return (
    <StyledList>
      {unlinkedSlackUsers.map((slackUser) => (
        <UnlinkedSlackUserRow
          key={slackUser.slackUserId}
          slackUser={slackUser}
          onLinkSaved={onLinkSaved}
        />
      ))}
      {hasMore && (
        <StyledTruncationNote>
          There may be more unlinked users. Link some of these first, or find a
          specific person with the search below.
        </StyledTruncationNote>
      )}
    </StyledList>
  );
};
