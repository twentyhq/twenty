import { SlackSelect } from 'src/front-components/components/SlackSelect';
import { SLACK_CHANNEL_RULE_CAPABILITY_LABELS } from 'src/front-components/constants/slack-channel-rule-capability-labels.constant';
import { SLACK_CHANNEL_RULE_CAPABILITY } from 'src/logic-functions/constants/slack-channel-rule-capability';
import { type SlackChannelRuleCapability } from 'src/logic-functions/types/slack-channel-rule-capability.type';

const SLACK_CHANNEL_RULE_CAPABILITY_OPTIONS = Object.values(
  SLACK_CHANNEL_RULE_CAPABILITY,
).map((capability) => ({
  value: capability,
  label: SLACK_CHANNEL_RULE_CAPABILITY_LABELS[capability],
}));

type SlackChannelRuleCapabilitySelectProps = {
  id?: string;
  value: SlackChannelRuleCapability;
  onChange: (capability: SlackChannelRuleCapability) => void;
  disabled?: boolean;
  ariaLabel: string;
  size?: 'small' | 'medium';
};

export const SlackChannelRuleCapabilitySelect = ({
  id,
  value,
  onChange,
  disabled,
  ariaLabel,
  size,
}: SlackChannelRuleCapabilitySelectProps) => (
  <SlackSelect
    id={id}
    value={value}
    options={SLACK_CHANNEL_RULE_CAPABILITY_OPTIONS}
    onChange={onChange}
    ariaLabel={ariaLabel}
    disabled={disabled}
    size={size}
  />
);
