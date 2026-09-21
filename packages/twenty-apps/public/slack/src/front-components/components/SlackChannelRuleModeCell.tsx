import { isDefined } from 'twenty-sdk/utils';
import { Tag } from 'twenty-ui/data-display';

import { SlackChannelRuleModeSelect } from 'src/front-components/components/SlackChannelRuleModeSelect';
import { type SlackChannelRuleRecord } from 'src/front-components/types/slack-channel-rule-record.type';
import { DISCONNECTED_SLACK_WORKSPACE_LABEL } from 'src/front-components/utils/is-from-disconnected-slack-workspace.util';
import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';
import { isSlackChannelRuleMode } from 'src/logic-functions/utils/is-slack-channel-rule-mode';

type SlackChannelRuleModeCellProps = {
  rule: SlackChannelRuleRecord;
  displayedName: string;
  isDisconnected: boolean;
  disabled: boolean;
  onModeChange: (mode: SlackChannelRuleMode) => void;
};

export const SlackChannelRuleModeCell = ({
  rule,
  displayedName,
  isDisconnected,
  disabled,
  onModeChange,
}: SlackChannelRuleModeCellProps) => {
  if (isDisconnected) {
    return <Tag color="gray" text={DISCONNECTED_SLACK_WORKSPACE_LABEL} />;
  }

  const mode = isSlackChannelRuleMode(rule.mode) ? rule.mode : undefined;

  if (!isDefined(mode)) {
    return <Tag color="red" text="Unknown mode" />;
  }

  return (
    <SlackChannelRuleModeSelect
      value={mode}
      onChange={onModeChange}
      disabled={disabled}
      ariaLabel={`Rule mode for ${displayedName}`}
      size="small"
    />
  );
};
