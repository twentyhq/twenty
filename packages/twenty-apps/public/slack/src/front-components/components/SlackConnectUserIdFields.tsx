import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SlackUserLinkTextInput } from 'src/front-components/components/SlackUserLinkTextInput';

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.label`
  color: ${() => themeCssVariables.font.color.secondary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  font-weight: ${() => themeCssVariables.font.weight.medium};
`;

const StyledHint = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
`;

type SlackConnectUserIdFieldsProps = {
  slackUserId: string;
  slackTeamId: string;
  onSlackUserIdChange: (slackUserId: string) => void;
  onSlackTeamIdChange: (slackTeamId: string) => void;
  disabled?: boolean;
};

export const SlackConnectUserIdFields = ({
  slackUserId,
  slackTeamId,
  onSlackUserIdChange,
  onSlackTeamIdChange,
  disabled,
}: SlackConnectUserIdFieldsProps) => (
  <>
    <StyledField>
      <StyledLabel htmlFor="slack-user-id">Slack user ID</StyledLabel>
      <SlackUserLinkTextInput
        id="slack-user-id"
        value={slackUserId}
        onChange={(event) => onSlackUserIdChange(event.target.value)}
        placeholder="U0123456789"
        disabled={disabled}
      />
      <StyledHint>
        Use this for a Slack Connect user from another workspace, who will not
        appear in the search above.
      </StyledHint>
    </StyledField>
    <StyledField>
      <StyledLabel htmlFor="slack-team-id">Slack team ID (optional)</StyledLabel>
      <SlackUserLinkTextInput
        id="slack-team-id"
        value={slackTeamId}
        onChange={(event) => onSlackTeamIdChange(event.target.value)}
        placeholder="T0123456789"
        disabled={disabled}
      />
      <StyledHint>
        Defaults to the installed Slack workspace. Set it for a Slack Connect
        user, using the team ID their messages carry.
      </StyledHint>
    </StyledField>
  </>
);
