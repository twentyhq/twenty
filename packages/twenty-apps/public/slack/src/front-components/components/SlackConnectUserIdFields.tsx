import { SlackUserLinkFormField } from 'src/front-components/components/SlackUserLinkFormField';
import { SlackUserLinkFormHint } from 'src/front-components/components/SlackUserLinkFormHint';
import { SlackUserLinkTextInput } from 'src/front-components/components/SlackUserLinkTextInput';

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
    <SlackUserLinkFormField
      label="Slack user ID"
      htmlFor="slack-user-id"
      hint={
        <SlackUserLinkFormHint>
          Use this for a Slack Connect user from another workspace, who will not
          appear in the search above.
        </SlackUserLinkFormHint>
      }
    >
      <SlackUserLinkTextInput
        id="slack-user-id"
        value={slackUserId}
        onChange={(event) => onSlackUserIdChange(event.target.value)}
        placeholder="U0123456789"
        disabled={disabled}
      />
    </SlackUserLinkFormField>
    <SlackUserLinkFormField
      label="Slack team ID (optional)"
      htmlFor="slack-team-id"
      hint={
        <SlackUserLinkFormHint>
          Defaults to the installed Slack workspace. Set it for a Slack Connect
          user, using the team ID their messages carry.
        </SlackUserLinkFormHint>
      }
    >
      <SlackUserLinkTextInput
        id="slack-team-id"
        value={slackTeamId}
        onChange={(event) => onSlackTeamIdChange(event.target.value)}
        placeholder="T0123456789"
        disabled={disabled}
      />
    </SlackUserLinkFormField>
  </>
);
