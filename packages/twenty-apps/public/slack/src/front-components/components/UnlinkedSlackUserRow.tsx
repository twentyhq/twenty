import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SlackUserLinkFormHint } from 'src/front-components/components/SlackUserLinkFormHint';
import { WorkspaceMemberPicker } from 'src/front-components/components/WorkspaceMemberPicker';
import { useSetSlackUserLink } from 'src/front-components/hooks/use-set-slack-user-link';
import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';
import { buildSlackUserLinkSaveNote } from 'src/front-components/utils/build-slack-user-link-save-note.util';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

const StyledRow = styled.div`
  border: 1px solid ${() => themeCssVariables.border.color.light};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
  padding: ${() => themeCssVariables.spacing[3]};
`;

const StyledRowMain = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${() => themeCssVariables.spacing[4]};
  justify-content: space-between;
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

const StyledLinkControls = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
`;

type UnlinkedSlackUserRowProps = {
  slackUser: SlackResolvedUser;
  onLinkSaved: () => void;
};

export const UnlinkedSlackUserRow = ({
  slackUser,
  onLinkSaved,
}: UnlinkedSlackUserRowProps) => {
  const [selectedMember, setSelectedMember] =
    useState<WorkspaceMemberOption | null>(null);
  const { setSlackUserLink, isSubmitting } = useSetSlackUserLink();

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
    <StyledRow>
      <StyledRowMain>
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
        <StyledLinkControls>
          <WorkspaceMemberPicker
            selectedMember={selectedMember}
            onSelect={setSelectedMember}
            onClear={() => setSelectedMember(null)}
            disabled={isSubmitting}
          />
          <Button
            title={isSubmitting ? 'Linking…' : 'Link'}
            variant="secondary"
            disabled={!isDefined(selectedMember) || isSubmitting}
            onClick={handleLink}
          />
        </StyledLinkControls>
      </StyledRowMain>
      {isDefined(selectedMember) && (
        <SlackUserLinkFormHint>
          {buildSlackUserLinkSaveNote({
            resolvedUser: slackUser,
            selectedMember,
            existingLink: undefined,
          })}
        </SlackUserLinkFormHint>
      )}
    </StyledRow>
  );
};
