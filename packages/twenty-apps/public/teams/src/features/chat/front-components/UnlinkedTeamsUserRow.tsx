import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { enqueueSnackbar, useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { InlineWorkspaceMemberPicker } from 'src/features/chat/front-components/InlineWorkspaceMemberPicker';
import {
  TeamsTableCell,
  TeamsTableRow,
} from 'src/features/chat/front-components/TeamsSettingsTable';
import { type WorkspaceMemberOption } from 'src/features/chat/front-components/types/workspace-member-option.type';
import { useSetTeamsUserLink } from 'src/features/chat/front-components/hooks/use-set-teams-user-link';
import { type TeamsUserSearchOption } from 'src/features/chat/logic-functions/types/teams-user-search-option.type';

const StyledIdentity = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledName = styled.div`
  color: ${() => themeCssVariables.font.color.primary};
  min-width: 0;
`;

const StyledNoEmail = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
`;

const StyledMemberCell = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${() => themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-width: 0;
`;

const StyledLinkControls = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${() => themeCssVariables.spacing[2]};
`;

type UnlinkedTeamsUserRowProps = {
  teamsUser: TeamsUserSearchOption;
  gridTemplateColumns: string;
  onLinkSaved: () => void;
};

export const UnlinkedTeamsUserRow = ({
  teamsUser,
  gridTemplateColumns,
  onLinkSaved,
}: UnlinkedTeamsUserRowProps) => {
  const { t } = useTranslate();
  const [selectedMember, setSelectedMember] =
    useState<WorkspaceMemberOption | null>(null);
  const { setTeamsUserLink, isSubmitting } = useSetTeamsUserLink();

  const displayedName = isNonEmptyString(teamsUser.displayName)
    ? teamsUser.displayName
    : teamsUser.teamsUserAadObjectId;

  const handleLink = async () => {
    if (!isDefined(selectedMember)) {
      return;
    }

    const result = await setTeamsUserLink({
      workspaceMemberId: selectedMember.id,
      teamsUserAadObjectId: teamsUser.teamsUserAadObjectId,
      name: teamsUser.displayName,
    });

    enqueueSnackbar({
      message: isNonEmptyString(result.error) ? result.error : result.message,
      variant: result.success ? 'success' : 'error',
    });

    if (result.success) {
      setSelectedMember(null);
      onLinkSaved();
    }
  };

  return (
    <TeamsTableRow gridTemplateColumns={gridTemplateColumns}>
      <TeamsTableCell>
        <StyledIdentity>
          <Avatar
            name={displayedName}
            colorSeed={teamsUser.teamsUserAadObjectId}
            shape="circle"
            size="md"
          />
          <StyledName>
            <OverflowingTextWithTooltip text={displayedName} />
          </StyledName>
        </StyledIdentity>
      </TeamsTableCell>
      <TeamsTableCell>
        {isNonEmptyString(teamsUser.email) ? (
          <OverflowingTextWithTooltip text={teamsUser.email} />
        ) : (
          <StyledNoEmail>{t('No email')}</StyledNoEmail>
        )}
      </TeamsTableCell>
      <TeamsTableCell>
        <StyledMemberCell>
          <InlineWorkspaceMemberPicker
            selectedMember={selectedMember}
            onSelect={setSelectedMember}
            disabled={isSubmitting}
          />
          <StyledLinkControls>
            <Button
              type="button"
              size="sm"
              variant="outline"
              color="accent"
              disabled={!isDefined(selectedMember) || isSubmitting}
              onClick={handleLink}
            >
              {isSubmitting ? t('Linking…') : t('Link')}
            </Button>
          </StyledLinkControls>
        </StyledMemberCell>
      </TeamsTableCell>
    </TeamsTableRow>
  );
};
