import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

const StyledResolvedUser = styled.div`
  align-items: center;
  background: ${() => themeCssVariables.background.secondary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${() => themeCssVariables.spacing[2]};
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
`;

const StyledMeta = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
`;

const StyledChangeButton = styled.button`
  background: transparent;
  border: none;
  color: ${() => themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  padding: 0;
`;

type ResolvedSlackUserFieldProps = {
  resolvedUser: SlackResolvedUser;
  onChangeRequest: () => void;
  disabled?: boolean;
};

// The confirmed Slack account, shown the way the member picker shows its
// selection, so both sides of the link read as picked people.
export const ResolvedSlackUserField = ({
  resolvedUser,
  onChangeRequest,
  disabled,
}: ResolvedSlackUserFieldProps) => (
  <StyledResolvedUser>
    <StyledDetails>
      <StyledName>
        {resolvedUser.displayName ?? resolvedUser.slackUserId}
      </StyledName>
      <StyledMeta>
        {isNonEmptyString(resolvedUser.email)
          ? resolvedUser.email
          : `Slack user ${resolvedUser.slackUserId} · Team ${resolvedUser.slackTeamId}`}
      </StyledMeta>
    </StyledDetails>
    <StyledChangeButton
      type="button"
      onClick={onChangeRequest}
      disabled={disabled}
    >
      Change
    </StyledChangeButton>
  </StyledResolvedUser>
);
