import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

const StyledResolvedUser = styled.button`
  align-items: center;
  background: ${() => themeCssVariables.background.secondary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
  padding: ${() => themeCssVariables.spacing[2]};
  text-align: left;
  width: 100%;

  &:hover:enabled {
    border-color: ${() => themeCssVariables.color.blue};
  }

  &:disabled {
    cursor: default;
  }
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

type ResolvedSlackUserFieldProps = {
  resolvedUser: SlackResolvedUser;
  onChangeRequest: () => void;
  disabled?: boolean;
};

const buildFallbackMeta = (resolvedUser: SlackResolvedUser): string =>
  isNonEmptyString(resolvedUser.slackTeamId)
    ? `Slack user ${resolvedUser.slackUserId} · Team ${resolvedUser.slackTeamId}`
    : `Slack user ${resolvedUser.slackUserId}`;

export const ResolvedSlackUserField = ({
  resolvedUser,
  onChangeRequest,
  disabled,
}: ResolvedSlackUserFieldProps) => (
  <StyledResolvedUser
    type="button"
    onClick={onChangeRequest}
    disabled={disabled}
    aria-label="Change the Slack user"
  >
    <StyledDetails>
      <StyledName>
        {resolvedUser.displayName ?? resolvedUser.slackUserId}
      </StyledName>
      <StyledMeta>
        {isNonEmptyString(resolvedUser.email)
          ? resolvedUser.email
          : buildFallbackMeta(resolvedUser)}
      </StyledMeta>
    </StyledDetails>
  </StyledResolvedUser>
);
