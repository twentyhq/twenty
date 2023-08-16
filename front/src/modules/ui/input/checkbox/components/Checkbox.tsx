import * as React from 'react';
import styled from '@emotion/styled';

import { IconCheck, IconMinus } from '@/ui/icon';

export enum CheckboxVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
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
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckedChange?: (value: boolean) => void;
  variant?: CheckboxVariant;
  size?: CheckboxSize;
  shape?: CheckboxShape;
};

const StyledInputContainer = styled.div`
  align-items: center;
  display: flex;
  position: relative;
`;

type InputProps = {
  checkboxSize: CheckboxSize;
  variant: CheckboxVariant;
  indeterminate?: boolean;
  shape?: CheckboxShape;
  isChecked?: boolean;
};

const StyledInput = styled.input<InputProps>`
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
    background: ${({ theme, indeterminate, isChecked }) =>
      indeterminate || isChecked ? theme.color.blue : 'transparent'};
    border-color: ${({ theme, indeterminate, isChecked, variant }) => {
      switch (true) {
        case indeterminate || isChecked:
          return theme.color.blue;
        case variant === CheckboxVariant.Primary:
          return theme.border.color.inverted;
        case variant === CheckboxVariant.Tertiary:
          return theme.border.color.medium;
        default:
          return theme.border.color.secondaryInverted;
      }
    }};
    border-radius: ${({ theme, shape }) =>
      shape === CheckboxShape.Rounded
        ? theme.border.radius.rounded
        : theme.border.radius.sm};
    border-style: solid;
    border-width: ${({ variant }) =>
      variant === CheckboxVariant.Tertiary ? '2px' : '1px'};
    content: '';
    cursor: pointer;
    display: inline-block;
    height: var(--size);
    width: var(--size);
  }

  & + label > svg {
    --padding: ${({ checkboxSize, variant }) =>
      checkboxSize === CheckboxSize.Large ||
      variant === CheckboxVariant.Tertiary
        ? '2px'
        : '1px'};
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
  onCheckedChange,
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

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    onCheckedChange?.(event.target.checked);
    setIsInternalChecked(event.target.checked);
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
        onChange={handleChange}
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
