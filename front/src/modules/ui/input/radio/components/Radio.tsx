import * as React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { rgba } from '@/ui/theme/constants/colors';

import { RadioGroup } from './RadioGroup';

export enum RadioSize {
  Large = 'large',
  Small = 'small',
}

export enum LabelPosition {
  Left = 'left',
  Right = 'right',
}

const Container = styled.div<{ labelPosition?: LabelPosition }>`
  ${({ labelPosition }) =>
    labelPosition === LabelPosition.Left
      ? `
    flex-direction: row-reverse;
  `
      : `
    flex-direction: row;
  `};
  align-items: center;
  display: flex;
`;

type RadioInputProps = {
  radioSize?: RadioSize;
};

const RadioInput = styled(motion.input)<RadioInputProps>`
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.font.color.secondary};
  border-radius: 50%;
  :hover {
    background-color: ${({ theme, checked }) => {
      if (!checked) {
        return theme.background.tertiary;
      }
    }};
    outline: 4px solid
      ${({ theme, checked }) => {
        if (!checked) {
          return theme.background.tertiary;
        }
        return rgba(theme.color.blue, 0.12);
      }};
  }
  &:checked {
    background-color: ${({ theme }) => theme.color.blue};
    border: none;
    &::after {
      background-color: ${({ theme }) => theme.color.gray0};
      border-radius: 50%;
      content: '';
      height: ${({ radioSize }) =>
        radioSize === RadioSize.Large ? '8px' : '6px'};
      left: 50%;
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: ${({ radioSize }) =>
        radioSize === RadioSize.Large ? '8px' : '6px'};
    }
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.12;
  }
  height: ${({ radioSize }) =>
    radioSize === RadioSize.Large ? '18px' : '16px'};
  position: relative;
  width: ${({ radioSize }) =>
    radioSize === RadioSize.Large ? '18px' : '16px'};
`;

type LabelProps = {
  disabled?: boolean;
  labelPosition?: LabelPosition;
};

const Label = styled.label<LabelProps>`
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-left: ${({ theme, labelPosition }) =>
    labelPosition === LabelPosition.Right ? theme.spacing(2) : '0px'};
  margin-right: ${({ theme, labelPosition }) =>
    labelPosition === LabelPosition.Left ? theme.spacing(2) : '0px'};
  opacity: ${({ disabled }) => (disabled ? 0.32 : 1)};
`;

export type RadioProps = {
  style?: React.CSSProperties;
  className?: string;
  checked?: boolean;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckedChange?: (checked: boolean) => void;
  size?: RadioSize;
  disabled?: boolean;
  labelPosition?: LabelPosition;
};

export function Radio({
  checked,
  value,
  onChange,
  onCheckedChange,
  size = RadioSize.Small,
  labelPosition = LabelPosition.Right,
  disabled = false,
  ...restProps
}: RadioProps) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onChange?.(event);
    onCheckedChange?.(event.target.checked);
  }

  return (
    <Container {...restProps} labelPosition={labelPosition}>
      <RadioInput
        type="radio"
        id="input-radio"
        name="input-radio"
        data-testid="input-radio"
        checked={checked}
        value={value}
        radioSize={size}
        disabled={disabled}
        onChange={handleChange}
        initial={{ scale: 0.95 }}
        animate={{ scale: checked ? 1.05 : 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
      {value && (
        <Label
          htmlFor="input-radio"
          labelPosition={labelPosition}
          disabled={disabled}
        >
          {value}
        </Label>
      )}
    </Container>
  );
}

Radio.Group = RadioGroup;
