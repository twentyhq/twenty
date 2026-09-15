import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  SLACK_CHANNEL_RULE_MODE_LABELS,
  SLACK_CHANNEL_RULE_MODE_ORDER,
} from 'src/front-components/constants/slack-channel-rule-mode-labels.constant';
import { type SlackChannelRuleMode } from 'src/logic-functions/types/slack-channel-rule-mode.type';
import { isSlackChannelRuleMode } from 'src/logic-functions/utils/is-slack-channel-rule-mode';

// A native select: twenty-ui's Select is a base-ui control whose click
// handler needs PointerEvent, which the front component sandbox lacks.
const StyledSelect = styled.select`
  background-color: ${() => themeCssVariables.background.transparent.lighter};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  height: 32px;
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
    {SLACK_CHANNEL_RULE_MODE_ORDER.map((mode) => (
      <option key={mode} value={mode}>
        {SLACK_CHANNEL_RULE_MODE_LABELS[mode]}
      </option>
    ))}
  </StyledSelect>
);
