import { SlackNativeSelect } from 'src/front-components/components/SlackNativeSelect';
import { SLACK_CHANNEL_RULE_MODE_LABELS } from 'src/front-components/constants/slack-channel-rule-mode-labels.constant';
import { SLACK_CHANNEL_RULE_MODE } from 'src/logic-functions/constants/slack-channel-rule-mode';
import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';
import { isSlackChannelRuleMode } from 'src/logic-functions/utils/is-slack-channel-rule-mode';

type SlackChannelRuleModeSelectProps = {
  id?: string;
  value: SlackChannelRuleMode;
  onChange: (mode: SlackChannelRuleMode) => void;
  disabled?: boolean;
  ariaLabel: string;
};

export const SlackChannelRuleModeSelect = ({
  id,
  value,
  onChange,
  disabled,
  ariaLabel,
}: SlackChannelRuleModeSelectProps) => (
  <SlackNativeSelect
    id={id}
    value={value}
    disabled={disabled}
    aria-label={ariaLabel}
    onChange={(event) => {
      if (isSlackChannelRuleMode(event.target.value)) {
        onChange(event.target.value);
      }
    }}
  >
    {Object.values(SLACK_CHANNEL_RULE_MODE).map((mode) => (
      <option key={mode} value={mode}>
        {SLACK_CHANNEL_RULE_MODE_LABELS[mode]}
      </option>
    ))}
  </SlackNativeSelect>
);
