import { isNonEmptyString } from '@sniptt/guards';

import { SlackPickedEntityButton } from 'src/front-components/components/SlackPickedEntityButton';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

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
  <SlackPickedEntityButton
    name={resolvedUser.displayName ?? resolvedUser.slackUserId}
    meta={
      isNonEmptyString(resolvedUser.email)
        ? resolvedUser.email
        : buildFallbackMeta(resolvedUser)
    }
    changeLabel="Change the Slack user"
    onChangeRequest={onChangeRequest}
    disabled={disabled}
  />
);
