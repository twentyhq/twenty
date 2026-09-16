import { SlackNativeSelect } from 'src/front-components/components/SlackNativeSelect';
import { SLACK_CHANNEL_RULE_CAPABILITY_LABELS } from 'src/front-components/constants/slack-channel-rule-capability-labels.constant';
import { SLACK_CHANNEL_RULE_CAPABILITY } from 'src/logic-functions/constants/slack-channel-rule-capability';
import { type SlackChannelRuleCapability } from 'src/logic-functions/types/slack-channel-rule-capability.type';
import { isSlackChannelRuleCapability } from 'src/logic-functions/utils/is-slack-channel-rule-capability';

type SlackChannelRuleCapabilitySelectProps = {
  id?: string;
  value: SlackChannelRuleCapability;
  onChange: (capability: SlackChannelRuleCapability) => void;
  disabled?: boolean;
  ariaLabel: string;
};

export const SlackChannelRuleCapabilitySelect = ({
  id,
  value,
  onChange,
  disabled,
  ariaLabel,
}: SlackChannelRuleCapabilitySelectProps) => (
  <SlackNativeSelect
    id={id}
    value={value}
    disabled={disabled}
    aria-label={ariaLabel}
    onChange={(event) => {
      if (isSlackChannelRuleCapability(event.target.value)) {
        onChange(event.target.value);
      }
    }}
  >
    {Object.values(SLACK_CHANNEL_RULE_CAPABILITY).map((capability) => (
      <option key={capability} value={capability}>
        {SLACK_CHANNEL_RULE_CAPABILITY_LABELS[capability]}
      </option>
    ))}
  </SlackNativeSelect>
);
