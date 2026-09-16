import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SLACK_CHANNEL_RULE_MODE_LABELS } from 'src/front-components/constants/slack-channel-rule-mode-labels.constant';
import { SLACK_CHANNEL_RULE_MODE } from 'src/logic-functions/constants/slack-channel-rule-mode';
import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';
import { isSlackChannelRuleMode } from 'src/logic-functions/utils/is-slack-channel-rule-mode';

// Native select: twenty-ui's Select needs PointerEvent, which the front component sandbox lacks
const StyledSelect = styled.select`
  background-color: ${() => themeCssVariables.background.transparent.lighter};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  height: ${() => themeCssVariables.spacing[8]};
  outline: none;
  padding: 0 ${() => themeCssVariables.spacing[2]};
  width: 100%;

  &:disabled {
    color: ${() => themeCssVariables.font.color.tertiary};
  }

  &:focus {
    border-color: ${() => themeCssVariables.color.blue};
  }
`;

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
  <StyledSelect
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
  </StyledSelect>
);
