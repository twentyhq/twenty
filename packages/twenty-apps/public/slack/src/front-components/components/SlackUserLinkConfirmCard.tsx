import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

const StyledConfirmCard = styled.div`
  background: ${() => themeCssVariables.background.secondary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
  padding: ${() => themeCssVariables.spacing[3]};
`;

const StyledConfirmName = styled.span`
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  font-weight: ${() => themeCssVariables.font.weight.medium};
`;

const StyledConfirmMeta = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
`;

const StyledConfirmNote = styled.span`
  color: ${() => themeCssVariables.font.color.secondary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
`;

type SlackUserLinkConfirmCardProps = {
  resolvedUser: SlackResolvedUser;
  selectedMemberEmail: string | undefined;
};

const getConfirmNote = (
  resolvedUser: SlackResolvedUser,
  selectedMemberEmail: string | undefined,
): string => {
  if (!resolvedUser.isInInstalledWorkspace) {
    return 'This account is outside your Slack workspace, so the link is admin-set and active right away.';
  }

  const matchesSelectedMember =
    isNonEmptyString(resolvedUser.email) &&
    isNonEmptyString(selectedMemberEmail) &&
    resolvedUser.email.toLowerCase() === selectedMemberEmail.toLowerCase();

  return matchesSelectedMember
    ? 'Their Slack email matches this workspace member, so the link activates immediately with no approval step.'
    : 'We will ask this person to approve in Slack. The link activates once they approve.';
};

export const SlackUserLinkConfirmCard = ({
  resolvedUser,
  selectedMemberEmail,
}: SlackUserLinkConfirmCardProps) => (
  <StyledConfirmCard>
    <StyledConfirmName>
      {resolvedUser.displayName ?? resolvedUser.slackUserId}
    </StyledConfirmName>
    <StyledConfirmMeta>
      Slack user {resolvedUser.slackUserId}
      {isNonEmptyString(resolvedUser.slackTeamId)
        ? ` · Team ${resolvedUser.slackTeamId}`
        : ''}
    </StyledConfirmMeta>
    <StyledConfirmNote>
      {getConfirmNote(resolvedUser, selectedMemberEmail)}
    </StyledConfirmNote>
  </StyledConfirmCard>
);
