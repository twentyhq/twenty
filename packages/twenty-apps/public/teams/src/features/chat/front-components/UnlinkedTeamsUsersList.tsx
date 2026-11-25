import styled from '@emotion/styled';
import { useTranslate } from 'twenty-sdk/front-component';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  TeamsTable,
  TeamsTableBody,
  TeamsTableHeader,
  TeamsTableRow,
} from 'src/features/chat/front-components/TeamsSettingsTable';
import { UnlinkedTeamsUserRow } from 'src/features/chat/front-components/UnlinkedTeamsUserRow';
import { type TeamsUserSearchOption } from 'src/features/chat/logic-functions/types/teams-user-search-option.type';

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

type UnlinkedTeamsUsersListProps = {
  unlinkedTeamsUsers: TeamsUserSearchOption[];
  hasMore: boolean;
  onLinkSaved: () => void;
};

export const UnlinkedTeamsUsersList = ({
  unlinkedTeamsUsers,
  hasMore,
  onLinkSaved,
}: UnlinkedTeamsUsersListProps) => {
  const { t } = useTranslate();

  if (unlinkedTeamsUsers.length === 0) {
    return (
      <StyledEmptyState>
        {hasMore
          ? t(
              'The organization directory is too large to scan in one pass. Find a specific person with the search below.',
            )
          : t('Everyone in the organization directory is linked.')}
      </StyledEmptyState>
    );
  }

  return (
    <TeamsTable>
      <TeamsTableRow gridTemplateColumns={UNLINKED_GRID_TEMPLATE_COLUMNS}>
        <TeamsTableHeader>{t('Teams user')}</TeamsTableHeader>
        <TeamsTableHeader>{t('Email')}</TeamsTableHeader>
        <TeamsTableHeader>{t('Workspace member')}</TeamsTableHeader>
      </TeamsTableRow>
      <TeamsTableBody>
        {unlinkedTeamsUsers.map((teamsUser) => (
          <UnlinkedTeamsUserRow
            key={teamsUser.teamsUserAadObjectId}
            teamsUser={teamsUser}
            gridTemplateColumns={UNLINKED_GRID_TEMPLATE_COLUMNS}
            onLinkSaved={onLinkSaved}
          />
        ))}
        {hasMore && (
          <StyledTruncationNote>
            {t(
              'There may be more unlinked users. Link some of these first, or find a specific person with the search below.',
            )}
          </StyledTruncationNote>
        )}
      </TeamsTableBody>
    </TeamsTable>
  );
};
