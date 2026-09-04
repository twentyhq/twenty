import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Avatar } from 'twenty-ui/data-display';
import { Button } from 'twenty-ui/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InlineWorkspaceMemberPicker } from 'src/front-components/components/InlineWorkspaceMemberPicker';
import {
  SlackTableCell,
  SlackTableRow,
} from 'src/front-components/components/SlackSettingsTable';
import { useSetSlackUserLink } from 'src/front-components/hooks/use-set-slack-user-link';
import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

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

type UnlinkedSlackUserRowProps = {
  slackUser: SlackResolvedUser;
  gridTemplateColumns: string;
  onLinkSaved: () => void;
};

export const UnlinkedSlackUserRow = ({
  slackUser,
  gridTemplateColumns,
  onLinkSaved,
}: UnlinkedSlackUserRowProps) => {
  const [selectedMember, setSelectedMember] =
    useState<WorkspaceMemberOption | null>(null);
  const { setSlackUserLink, isSubmitting } = useSetSlackUserLink();

  const displayedName = isNonEmptyString(slackUser.displayName)
    ? slackUser.displayName
    : slackUser.slackUserId;

  const handleLink = async () => {
    if (!isDefined(selectedMember)) {
      return;
    }

    const result = await setSlackUserLink({
      workspaceMemberId: selectedMember.id,
      slackUserId: slackUser.slackUserId,
      slackTeamId: isNonEmptyString(slackUser.slackTeamId)
        ? slackUser.slackTeamId
        : undefined,
      name: slackUser.displayName,
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
    <SlackTableRow gridTemplateColumns={gridTemplateColumns}>
      <SlackTableCell>
        <StyledIdentity>
          <Avatar
            placeholder={displayedName}
            placeholderColorSeed={slackUser.slackUserId}
            type="rounded"
            size="md"
          />
          <StyledName>
            <OverflowingTextWithTooltip text={displayedName} />
          </StyledName>
        </StyledIdentity>
      </SlackTableCell>
      <SlackTableCell>
        {isNonEmptyString(slackUser.email) ? (
          <OverflowingTextWithTooltip text={slackUser.email} />
        ) : (
          <StyledNoEmail>No confirmed email</StyledNoEmail>
        )}
      </SlackTableCell>
      <SlackTableCell>
        <StyledMemberCell>
          <InlineWorkspaceMemberPicker
            selectedMember={selectedMember}
            onSelect={setSelectedMember}
            disabled={isSubmitting}
          />
          <StyledLinkControls>
            <Button
              type="button"
              title={isSubmitting ? 'Linking…' : 'Link'}
              size="small"
              variant="secondary"
              accent="blue"
              disabled={!isDefined(selectedMember) || isSubmitting}
              onClick={handleLink}
            />
          </StyledLinkControls>
        </StyledMemberCell>
      </SlackTableCell>
    </SlackTableRow>
  );
};
