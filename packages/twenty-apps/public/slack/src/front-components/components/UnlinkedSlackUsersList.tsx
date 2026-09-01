import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  SlackTable,
  SlackTableBody,
  SlackTableHeader,
  SlackTableRow,
} from 'src/front-components/components/SlackSettingsTable';
import { UnlinkedSlackUserRow } from 'src/front-components/components/UnlinkedSlackUserRow';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

const UNLINKED_GRID_TEMPLATE_COLUMNS = '2fr 2fr 3fr';

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
  padding: ${() => themeCssVariables.spacing[1]}
    ${() => themeCssVariables.spacing[2]};
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
  if (unlinkedSlackUsers.length === 0) {
    return (
      <StyledEmptyState>
        {hasMore
          ? 'The Slack roster is too large to scan in one pass. Find a specific person with the search below.'
          : 'Everyone in the Slack workspace is linked.'}
      </StyledEmptyState>
    );
  }

  return (
    <SlackTable>
      <SlackTableRow gridTemplateColumns={UNLINKED_GRID_TEMPLATE_COLUMNS}>
        <SlackTableHeader>Slack user</SlackTableHeader>
        <SlackTableHeader>Email</SlackTableHeader>
        <SlackTableHeader>Workspace member</SlackTableHeader>
      </SlackTableRow>
      <SlackTableBody>
        {unlinkedSlackUsers.map((slackUser) => (
          <UnlinkedSlackUserRow
            key={slackUser.slackUserId}
            slackUser={slackUser}
            gridTemplateColumns={UNLINKED_GRID_TEMPLATE_COLUMNS}
            onLinkSaved={onLinkSaved}
          />
        ))}
        {hasMore && (
          <StyledTruncationNote>
            There may be more unlinked users. Link some of these first, or find
            a specific person with the search below.
          </StyledTruncationNote>
        )}
      </SlackTableBody>
    </SlackTable>
  );
};
