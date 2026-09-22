import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';
import { Tag } from 'twenty-ui/data-display';

import { SlackChannelRuleCapabilitySelect } from 'src/front-components/components/SlackChannelRuleCapabilitySelect';
import { type SlackChannelRuleRecord } from 'src/front-components/types/slack-channel-rule-record.type';
import { SLACK_CHANNEL_RULE_CAPABILITY } from 'src/logic-functions/constants/slack-channel-rule-capability';
import { SLACK_CHANNEL_RULE_MODE } from 'src/logic-functions/constants/slack-channel-rule-mode';
import { type SlackChannelRuleCapability } from 'src/logic-functions/types/slack-channel-rule-capability.type';
import { isSlackChannelRuleCapability } from 'src/logic-functions/utils/is-slack-channel-rule-capability';

const toDisplayedCapability = (
  capability: string | null,
): SlackChannelRuleCapability | undefined => {
  if (!isNonEmptyString(capability)) {
    return SLACK_CHANNEL_RULE_CAPABILITY.FULL;
  }

  return isSlackChannelRuleCapability(capability) ? capability : undefined;
};

type SlackChannelRuleCapabilityCellProps = {
  rule: SlackChannelRuleRecord;
  displayedName: string;
  isDisconnected: boolean;
  disabled: boolean;
  onCapabilityChange: (capability: SlackChannelRuleCapability) => void;
};

export const SlackChannelRuleCapabilityCell = ({
  rule,
  displayedName,
  isDisconnected,
  disabled,
  onCapabilityChange,
}: SlackChannelRuleCapabilityCellProps) => {
  if (isDisconnected || rule.mode === SLACK_CHANNEL_RULE_MODE.SILENT) {
    return <Tag color="gray" text="Not applicable" />;
  }

  const capability = toDisplayedCapability(rule.capability);

  if (!isDefined(capability)) {
    return <Tag color="red" text="Unknown capability" />;
  }

  return (
    <SlackChannelRuleCapabilitySelect
      value={capability}
      onChange={onCapabilityChange}
      disabled={disabled}
      ariaLabel={`Capability for ${displayedName}`}
      size="small"
    />
  );
};
