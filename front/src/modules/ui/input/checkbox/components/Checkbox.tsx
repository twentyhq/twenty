import * as React from 'react';
import styled from '@emotion/styled';

import { IconCheck, IconMinus } from '@/ui/icon';

export enum CheckboxVariant {
  Primary = 'primary',
  Secondary = 'secondary',
}

export enum CheckboxShape {
  Squared = 'squared',
  Rounded = 'rounded',
}

export enum CheckboxSize {
  Large = 'large',
  Small = 'small',
}

type OwnProps = {
  checked: boolean;
  indeterminate?: boolean;
  onChange?: (value: boolean) => void;
  variant?: CheckboxVariant;
  size?: CheckboxSize;
  shape?: CheckboxShape;
};

const StyledInputContainer = styled.div`
  align-items: center;
  display: flex;
  position: relative;
`;

const StyledInput = styled.input<{
  checkboxSize: CheckboxSize;
  variant: CheckboxVariant;
  indeterminate?: boolean;
  shape?: CheckboxShape;
  isChecked: boolean;
}>`
  cursor: pointer;
  margin: 0;
  opacity: 0;
  position: absolute;
  z-index: 10;

  & + label {
    --size: ${({ checkboxSize }) =>
      checkboxSize === CheckboxSize.Large ? '18px' : '12px'};
    cursor: pointer;
    height: calc(var(--size) + 2px);
    padding: 0;
    position: relative;
    width: calc(var(--size) + 2px);
  }

  & + label:before {
    --size: ${({ checkboxSize }) =>
      checkboxSize === CheckboxSize.Large ? '18px' : '12px'};
    background: ${({ theme, indeterminate }) =>
      indeterminate ? theme.color.blue : 'transparent'};
    border-color: ${({ theme, indeterminate, variant }) =>
      indeterminate
        ? theme.color.blue
        : variant === CheckboxVariant.Primary
        ? theme.border.color.inverted
        : theme.border.color.secondaryInverted};
    border-radius: ${({ theme, shape }) =>
      shape === CheckboxShape.Rounded
        ? theme.border.radius.rounded
        : theme.border.radius.sm};
    border-style: solid;
    border-width: 1px;
    content: '';
    cursor: pointer;
    display: inline-block;
    height: var(--size);
    width: var(--size);
  }

  & + label:before {
    background: ${({ theme, isChecked }) =>
      isChecked ? theme.color.blue : 'inherit'};
    border-color: ${({ theme, isChecked }) =>
      isChecked ? theme.color.blue : 'inherit'};
  }

  & + label > svg {
    --padding: ${({ checkboxSize }) =>
      checkboxSize === CheckboxSize.Large ? '2px' : '1px'};
    --size: ${({ checkboxSize }) =>
      checkboxSize === CheckboxSize.Large ? '16px' : '12px'};
    height: var(--size);
    left: var(--padding);
    position: absolute;
    stroke: ${({ theme }) => theme.grayScale.gray0};
    top: var(--padding);
    width: var(--size);
  }
`;

export function Checkbox({
  checked,
  onChange,
  indeterminate,
  variant = CheckboxVariant.Primary,
  size = CheckboxSize.Small,
  shape = CheckboxShape.Squared,
}: OwnProps) {
  const [isInternalChecked, setIsInternalChecked] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    setIsInternalChecked(checked);
  }, [checked]);
  function handleChange(value: boolean) {
    onChange?.(value);
    setIsInternalChecked(!isInternalChecked);
  }

  return (
    <StyledInputContainer>
      <StyledInput
        autoComplete="off"
        type="checkbox"
        name="styled-checkbox"
        data-testid="input-checkbox"
        checked={isInternalChecked}
        indeterminate={indeterminate}
        variant={variant}
        checkboxSize={size}
        shape={shape}
        isChecked={isInternalChecked}
        onChange={(event) => handleChange(event.target.checked)}
      />
      <label htmlFor="checkbox">
        {indeterminate ? (
          <IconMinus />
        ) : isInternalChecked ? (
          <IconCheck />
        ) : (
          <></>
        )}
      </label>
    </StyledInputContainer>
  );
}
