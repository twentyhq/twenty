import { SlackSelect } from 'src/front-components/components/SlackSelect';
import { SLACK_CHANNEL_RULE_MODE_LABELS } from 'src/front-components/constants/slack-channel-rule-mode-labels.constant';
import { SLACK_CHANNEL_RULE_MODE } from 'src/logic-functions/constants/slack-channel-rule-mode';
import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';

const SLACK_CHANNEL_RULE_MODE_OPTIONS = Object.values(
  SLACK_CHANNEL_RULE_MODE,
).map((mode) => ({ value: mode, label: SLACK_CHANNEL_RULE_MODE_LABELS[mode] }));

type SlackChannelRuleModeSelectProps = {
  id?: string;
  value: SlackChannelRuleMode;
  onChange: (mode: SlackChannelRuleMode) => void;
  disabled?: boolean;
  ariaLabel: string;
  size?: 'small' | 'medium';
};

export const SlackChannelRuleModeSelect = ({
  id,
  value,
  onChange,
  disabled,
  ariaLabel,
  size,
}: SlackChannelRuleModeSelectProps) => (
  <SlackSelect
    id={id}
    value={value}
    options={SLACK_CHANNEL_RULE_MODE_OPTIONS}
    onChange={onChange}
    ariaLabel={ariaLabel}
    disabled={disabled}
    size={size}
  />
);
