import {
  TitleInput,
  type TitleInputProps,
} from '@/ui/input/components/TitleInput';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTitleInputContainer = styled.div`
  border-radius: ${themeCssVariables.border.radius.sm};
  max-width: 420px;
  min-width: 0;
  padding-left: ${themeCssVariables.spacing[1]};
  padding-right: ${themeCssVariables.spacing[1]};
  width: fit-content;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

  & > div:hover {
    background: transparent;
  }

  & > div :hover {
    background: transparent;
  }

  & > input:disabled {
    color: ${themeCssVariables.font.color.primary};
  }
`;

export type SettingsEditableTitleProps = TitleInputProps;

export const SettingsEditableTitle = ({
  disabled,
  instanceId,
  onChange,
  onClickOutside,
  onEnter,
  onEscape,
  onFocus,
  onShiftTab,
  onTab,
  placeholder,
  shouldFocus,
  sizeVariant = 'sm',
  value,
}: SettingsEditableTitleProps) => (
  <StyledTitleInputContainer>
    <TitleInput
      disabled={disabled}
      instanceId={instanceId}
      onChange={onChange}
      onClickOutside={onClickOutside}
      onEnter={onEnter}
      onEscape={onEscape}
      onFocus={onFocus}
      onShiftTab={onShiftTab}
      onTab={onTab}
      placeholder={placeholder}
      shouldFocus={shouldFocus}
      sizeVariant={sizeVariant}
      value={value}
    />
  </StyledTitleInputContainer>
);
